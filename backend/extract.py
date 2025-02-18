import requests
import PyPDF2
import re
import json
import os
import time
import psycopg2
from datetime import datetime
from dotenv import load_dotenv


# Ajouter après les imports
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'pharmacies.json')
# Ajouter après les imports, avant la connexion PostgreSQL

def extract_pdf_content(pdf_path):
    """Extrait le contenu texte de chaque page du PDF."""
    if not os.path.exists(pdf_path):
        print(f"❌ Fichier PDF non trouvé : {pdf_path}")
        return []
    
    try:
        with open(pdf_path, 'rb') as file:
            # Création du lecteur PDF
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extraction du texte de chaque page
            extracted_text = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text.strip():  # Ignorer les pages vides
                    extracted_text.append(text)
            
            if not extracted_text:
                print("⚠️ Aucun texte extrait du PDF")
                return []
            
            print(f"✅ {len(extracted_text)} pages extraites du PDF")
            return extracted_text
            
    except Exception as e:
        print(f"❌ Erreur lors de l'extraction du PDF : {e}")
        return []
    
# Connexion à PostgreSQL
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Connexion à PostgreSQL avec les variables d'environnement
try:
    conn = psycopg2.connect(
        dbname=os.getenv('DB_DATABASE'),  # Changé de DB_NAME à DB_DATABASE
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT', 5432)
    )
    cur = conn.cursor()
    print("✅ Connexion réussie à PostgreSQL !")
except Exception as e:
    print(f"❌ Erreur de connexion à PostgreSQL : {e}")
    exit()


def clean_address(address):
    """Nettoie et enrichit l'adresse pour Photon."""
    if not address or not isinstance(address, str):
        return None
    
    # Normalisation de base
    address = address.strip()
    address = address.replace("'", "'").replace('"', '')
    
    # Nettoyer les caractères spéciaux tout en gardant les accents
    address = re.sub(r'[^\w\s,àâéèêëîïôöùûüÿçÀÂÉÈÊËÎÏÔÖÙÛÜŸÇ]', '', address)
    
    # Liste des quartiers d'Abidjan
    quartiers = {
        'COCODY': 'Cocody',
        'YOPOUGON': 'Yopougon',
        'ABOBO': 'Abobo',
        'ADJAME': 'Adjamé',
        'PLATEAU': 'Plateau',
        'TREICHVILLE': 'Treichville',
        'MARCORY': 'Marcory',
        'KOUMASSI': 'Koumassi'
    }
    
    # Ajouter le quartier si identifiable
    address_upper = address.upper()
    for key, value in quartiers.items():
        if key in address_upper:
            if value not in address:
                address = f"{address}, {value}"
            break
    
    # Ajouter la ville si nécessaire
    if "ABIDJAN" not in address_upper:
        address += ", Abidjan, Côte d'Ivoire"
    
    return address

def get_coordinates_from_address(address):
    """Récupère les coordonnées géographiques d'une adresse en utilisant Photon."""
    if not address:
        return None, None
    
    # Mapping plus détaillé des zones avec points de référence
    zones = {
        'ABOBODOUME': {'zone': 'Abobodoumé', 'commune': 'Yopougon', 'ref': 'Rue des Jardins'},
        'LOCODJORO': {'zone': 'Locodjoro', 'commune': 'Yopougon', 'ref': 'Carrefour Locodjoro'},
        'NIANGON': {'zone': 'Niangon', 'commune': 'Yopougon', 'ref': 'Niangon Sud'},
        'YOPOUGON': {'zone': '', 'commune': 'Yopougon', 'ref': 'Terminus 40'},
        'ABOBO': {'zone': '', 'commune': 'Abobo', 'ref': 'Gare d\'Abobo'},
        'ADJAME': {'zone': '', 'commune': 'Adjamé', 'ref': 'Forum des marchés'},
        'PLATEAU': {'zone': '', 'commune': 'Plateau', 'ref': 'Avenue Chardy'},
        'COCODY': {'zone': '', 'commune': 'Cocody', 'ref': 'Carrefour de la Vie'},
        'KOUMASSI': {'zone': '', 'commune': 'Koumassi', 'ref': 'Grand Marché'},
        'MARCORY': {'zone': '', 'commune': 'Marcory', 'ref': 'Boulevard VGE'},
        'TREICHVILLE': {'zone': '', 'commune': 'Treichville', 'ref': 'Avenue 16'},
        'PORT BOUET': {'zone': '', 'commune': 'Port-Bouët', 'ref': 'Aéroport'}
    }
    
    # Construire une requête plus précise
    address_upper = address.upper()
    location_info = None
    
    # Chercher la zone correspondante
    for zone_key, zone_info in zones.items():
        if zone_key in address_upper:
            location_info = zone_info
            break
    
    if location_info:
        # Construire une requête plus précise avec le point de référence
        search_query = f"pharmacie {address}"
        if location_info['zone']:
            search_query += f", {location_info['zone']}"
        search_query += f", {location_info['commune']}"
        search_query += f" près de {location_info['ref']}, Abidjan, Côte d'Ivoire"
    else:
        # Si pas de zone trouvée, chercher dans toute la ville
        search_query = f"pharmacie {address}, Abidjan, Côte d'Ivoire"
    
    base_url = "http://photon.komoot.io/api"
    params = {
        'q': search_query,
        'limit': 1,
        'lang': 'fr',
        'lat': 5.359952,
        'lon': -4.008256,
        'location_bias_scale': 0.2
    }

    try:
        time.sleep(1)
        response = requests.get(base_url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        if data.get('features'):
            feature = data['features'][0]
            coordinates = feature['geometry']['coordinates']
            properties = feature.get('properties', {})
            
            # Vérification plus stricte des coordonnées
            lon, lat = coordinates
            
            # Vérifier si les coordonnées sont dans la bonne commune
            if location_info:
                address_lower = properties.get('name', '').lower()
                if (location_info['commune'].lower() in address_lower or 
                    location_info['zone'].lower() in address_lower):
                    print(f"✅ Coordonnées exactes trouvées pour : {address} dans {location_info['commune']}")
                    return lat, lon
                else:
                    print(f"⚠️ Localisation incertaine pour : {address}")
                    return None, None
            elif 4.5 < lat < 6.0 and -5.0 < lon < -3.0:
                print(f"✅ Coordonnées trouvées pour : {address}")
                return lat, lon
            
        print(f"⚠️ Aucune coordonnée trouvée pour : {address}")
        return None, None

    except Exception as e:
        print(f"❌ Erreur lors de la recherche des coordonnées : {e}")
        return None, None

def format_phone_number(phone_number):
    """ Formate le numéro de téléphone en ajoutant un slash après chaque série de 10 chiffres. """
    clean_number = phone_number.replace(" ", "").replace("/", "")
    formatted_number = '/'.join([clean_number[i:i+10] for i in range(0, len(clean_number), 10)])
    return formatted_number

def extract_week_dates(content):
    """Extrait la période de garde de la semaine à partir du contenu PDF avec une détection flexible."""
    # Nettoyer et normaliser le contenu
    content = content.replace('\n', ' ').strip().upper()
    content = re.sub(r'\s+', ' ', content)

    print("\nDébut du contenu analysé:")
    print(content[:200])

    # Collection de patterns pour différents formats possibles
    date_patterns = [
        # Format complet avec "SEMAINE DU"
        r"(?:GARDE|SEMAINE).*?(?:DU|DE).*?(?:SAMEDI|SAM\.?)?\s*(?:0?\s*)?(\d{1,2})\s*(?:AU|-)?\s*(?:VENDREDI|VEN\.?)?\s*(\d{1,2})\s*([A-ZÉÈ\s]+?)(?:\s+|/|-)(\d{4})",
        # Format sans "SEMAINE DU"
        r"(?:DU|DE)\s*(?:0?\s*)?(\d{1,2})\s*(?:AU|-)?\s*(\d{1,2})\s*([A-ZÉÈ\s]+?)(?:\s+|/|-)(\d{4})",
        # Format minimal avec juste les dates
        r"(\d{1,2})\s*(?:AU|-)?\s*(\d{1,2})\s*([A-ZÉÈ\s]+?)(?:\s+|/|-)(\d{4})",
    ]

    # Mapping extensif des mois avec toutes les variations possibles
    mois_mapping = {
        'JANV': '01', 'JANVIER': '01', 'JAN': '01',
        'FEVR': '02', 'FEVRIER': '02', 'FEV': '02', 'FEVRI': '02',
        'MARS': '03', 'MAR': '03',
        'AVRI': '04', 'AVRIL': '04', 'AVR': '04',
        'MAI': '05',
        'JUIN': '06', 'JUI': '06',
        'JUIL': '07', 'JUILLET': '07',
        'AOUT': '08', 'AOÛ': '08', 'AOU': '08',
        'SEPT': '09', 'SEPTEMBRE': '09', 'SEP': '09',
        'OCTO': '10', 'OCTOBRE': '10', 'OCT': '10',
        'NOVE': '11', 'NOVEMBRE': '11', 'NOV': '11',
        'DECE': '12', 'DÉCEMBRE': '12', 'DECEMBRE': '12', 'DEC': '12'
    }

    # Essayer chaque pattern jusqu'à ce qu'un fonctionne
    for pattern in date_patterns:
        match = re.search(pattern, content)
        if match:
            try:
                # Nettoyer les composants de la date
                jour_debut = match.group(1).strip().replace(' ', '')
                jour_fin = match.group(2).strip()
                mois_texte = match.group(3).strip()
                annee = match.group(4).strip()

                # Nettoyer le texte du mois
                mois_clean = re.sub(r'[^A-Z]', '', mois_texte)

                # Trouver le mois correspondant
                mois = None
                for key, value in mois_mapping.items():
                    if mois_clean.startswith(key) or key in mois_clean:
                        mois = value
                        break

                if not mois:
                    print(f"⚠️ Mois non reconnu, essai suivant : {mois_texte}")
                    continue

                # Formater et valider les dates
                try:
                    date_debut_str = f"{jour_debut.zfill(2)}/{mois}/{annee}"
                    date_fin_str = f"{jour_fin.zfill(2)}/{mois}/{annee}"

                    date_debut = datetime.strptime(date_debut_str, "%d/%m/%Y")
                    date_fin = datetime.strptime(date_fin_str, "%d/%m/%Y")

                    print(f"✅ Période trouvée : du {date_debut.strftime('%d %B %Y')} au {date_fin.strftime('%d %B %Y')}")
                    return date_debut.date(), date_fin.date()
                except ValueError as e:
                    print(f"⚠️ Format de date invalide : {e}")
                    continue

            except Exception as e:
                print(f"⚠️ Erreur lors du traitement : {e}")
                continue

    print("❌ Aucune date valide trouvée après tous les essais")
    raise ValueError("❌ Impossible de déterminer la période de garde")

def insert_pharmacies_to_db(pharmacies):
    """Insère les pharmacies extraites dans la base de données."""
    for pharmacy in pharmacies:
        # Vérification des données obligatoires
        if not pharmacy.get("date_de_garde"):
            print(f"⚠️ Date de garde manquante pour {pharmacy.get('name')} - Ignoré")
            continue

        try:
            cur.execute("""
                INSERT INTO pharmacies_de_garde 
                (nom, adresse, latitude, longitude, telephone, horaires, date_de_garde)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                pharmacy.get("name"),
                pharmacy.get("adresse", ""),
                pharmacy.get("latitude"),
                pharmacy.get("longitude"),
                ", ".join(pharmacy.get("phones", [])),
                pharmacy.get("horaires", ""),
                pharmacy.get("date_de_garde")
            ))
            conn.commit()
            print(f"✅ Pharmacie {pharmacy.get('name')} insérée avec succès")

        except Exception as e:
            print(f"❌ Erreur lors de l'insertion de {pharmacy.get('name')} : {e}")
            conn.rollback()


def extract_pharmacies(content):
    """Extrait les informations des pharmacies de garde depuis le contenu du PDF."""
    pharmacies = []
    try:
        # Extraction de la période de garde
        date_debut, date_fin = extract_week_dates(content)
        
        # Recherche des pharmacies dans le contenu
        # Pattern pour trouver les lignes contenant les informations des pharmacies
        pharmacy_pattern = r"PHCIE\s*(.*?)\s*/\s*(.*?TEL[.: ]*(\d[\d\s/]*\d))"
        matches = re.finditer(pharmacy_pattern, content, re.IGNORECASE)
        
        for match in matches:
            try:
                # Extraction du nom et des numéros de téléphone
                pharmacy_name = match.group(1).strip()
                phone_numbers = re.findall(r"\d{7,}", match.group(3).replace(' ', '').replace('/', ''))
                formatted_phones = [format_phone_number(number) for number in phone_numbers]
                
                # Récupération des coordonnées géographiques
                address = pharmacy_name  # Utilise le nom comme adresse de base
                latitude, longitude = get_coordinates_from_address(address)
                
                # Création de l'objet pharmacie
                pharmacy = {
                    "name": pharmacy_name,
                    "adresse": address,
                    "phones": formatted_phones,
                    "latitude": latitude,
                    "longitude": longitude,
                    "date_de_garde": date_debut.strftime('%Y-%m-%d'),
                    "horaires": "24h/24"  # Par défaut pour les pharmacies de garde
                }
                
                pharmacies.append(pharmacy)
                print(f"✅ Pharmacie extraite : {pharmacy_name}")
                
            except Exception as e:
                print(f"⚠️ Erreur lors de l'extraction d'une pharmacie : {e}")
                continue
        
        return pharmacies
        
    except ValueError as e:
        print(f"❌ Erreur : {e}")
        return []

def save_to_json(data, filepath):
    """Sauvegarde les données dans un fichier JSON."""
    try:
        # Création du dossier data s'il n'existe pas
        os.makedirs(os.path.dirname(filepath), existant=True)
        
        # Sauvegarde des données en JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        print(f"✅ Données sauvegardées dans {filepath}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde des données : {e}")

def main():
    pdf_path = 'C:\\Users\\hp\\Desktop\\pharmago_main\\backend\\data\\garde-fevrier-2025.pdf'
    extracted_text = extract_pdf_content(pdf_path)

    all_pharmacies = []
    for page_num, page_content in enumerate(extracted_text):
        pharmacies = extract_pharmacies(page_content)
        all_pharmacies.extend(pharmacies)

    if all_pharmacies:
        save_to_json(all_pharmacies, DATA_FILE)
        insert_pharmacies_to_db(all_pharmacies)  # Insérer dans la base de données
    else:
        print("⚠️ Aucune pharmacie trouvée.")

if __name__ == "__main__":
    main()

# Fermeture de la connexion à la base de données
cur.close()
conn.close()
