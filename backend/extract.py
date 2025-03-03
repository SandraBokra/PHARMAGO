import requests
import PyPDF2
import re
import json
import os
import time
from datetime import datetime
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://vpxuyzhshqpcyvhrzfsb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHV5emhzaHFwY3l2aHJ6ZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODQ3NzUsImV4cCI6MjA1NjA2MDc3NX0.e_efkq9gtjZ7PB8D1sfKAG6SEENHL865_gn1ydtu7hs"

# Initialisation du client Supabase (version simplifiée)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Constantes
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'pharmacies.json')

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

def format_phone_number(phone_str):
    """Formate les numéros de téléphone selon le format ivoirien."""
    # Nettoyer le numéro
    clean_number = re.sub(r'[^0-9]', '', phone_str)
    
    # Vérifier si le numéro a la bonne longueur (10 chiffres)
    if len(clean_number) != 10:
        return None

    # Format ivoirien: XX XX XX XX XX
    return ' '.join([clean_number[i:i+2] for i in range(0, 10, 2)])

def extract_phone_numbers(phone_text):
    """Extrait les numéros de téléphone du texte."""
    if not phone_text:
        return []

    print(f"\nTexte téléphone brut: {phone_text}")
    
    # Nettoyage préliminaire
    phone_text = re.sub(r'[–—]', '-', phone_text)
    phone_text = re.sub(r'\s+', ' ', phone_text)
    
    # Pattern amélioré pour les numéros ivoiriens
    phone_pattern = r'(?:0[1-7]|2[1-7])\s*(?:\d{2}\s*){4}'
    
    numbers = []
    for match in re.finditer(phone_pattern, phone_text):
        num = match.group()
        # Nettoyer et formater
        clean_num = ''.join(filter(str.isdigit, num))
        if len(clean_num) == 10:
            formatted = ' '.join(clean_num[i:i+2] for i in range(0, 10, 2))
            numbers.append(formatted)
            print(f"Numéro trouvé: {formatted}")
    
    print(f"Nombres extraits: {numbers}")
    return numbers

def extract_week_dates(content):
    """Extrait la période de garde de la semaine à partir du contenu PDF."""
    # Nettoyage initial du contenu
    content = content.replace('\n', ' ').upper()
    # Supprimer les espaces multiples tout en préservant les espaces simples dans les nombres
    content = ' '.join(content.split())
    
    print("\nDébut du contenu analysé:")
    print(content[:200])

    # Extraction des composants de date avec un pattern très permissif
    try:
        # 1. Trouver l'année
        annee_match = re.search(r'20\d{2}', content)
        if not annee_match:
            raise ValueError("Année non trouvée")
        annee = annee_match.group(0)

        # 2. Trouver le mois avec toutes les variations possibles
        mois_pattern = r'(?:JANV|FEVR|MARS|AVRI|MAI|JUIN|JUIL|AOUT|SEPT|OCTO|NOVE|DECE|JANVIER|FEVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DECEMBRE)(?:[A-Z\s]*)?'
        mois_match = re.search(mois_pattern, content)
        if not mois_match:
            raise ValueError("Mois non trouvé")
        mois_texte = mois_match.group(0)

        # 3. Trouver les jours avec un pattern très permissif
        jours_pattern = r'(?:SAMEDI|SAM\.?)?\s*(\d\s*\d|\d{1,2})\s*(?:AU|-)\s*(?:VENDREDI|VEN\.?)?\s*(\d\s*\d|\d{1,2})'
        jours_match = re.search(jours_pattern, content)
        if not jours_match:
            raise ValueError("Jours non trouvés")
        
        # Nettoyer les jours en supprimant les espaces
        jour_debut = re.sub(r'\s+', '', jours_match.group(1))
        jour_fin = re.sub(r'\s+', '', jours_match.group(2))

        # Mapping des mois
        mois_mapping = {
            'JANV': '01', 'JANVIER': '01',
            'FEVR': '02', 'FEVRIER': '02', 'FEV': '02',
            'MARS': '03',
            'AVRI': '04', 'AVRIL': '04',
            'MAI': '05',
            'JUIN': '06',
            'JUIL': '07', 'JUILLET': '07',
            'AOUT': '08', 'AOÛT': '08',
            'SEPT': '09', 'SEPTEMBRE': '09',
            'OCTO': '10', 'OCTOBRE': '10',
            'NOVE': '11', 'NOVEMBRE': '11',
            'DECE': '12', 'DECEMBRE': '12', 'DÉCEMBRE': '12'
        }

        # Trouver le numéro du mois
        mois = None
        mois_clean = re.sub(r'[^A-Z]', '', mois_texte)
        for key, value in mois_mapping.items():
            if key in mois_clean:
                mois = value
                break

        if not mois:
            raise ValueError(f"Mois non reconnu : {mois_texte}")

        # Formatage et validation des dates
        try:
            # Assurer que les jours sont sur 2 chiffres
            jour_debut = jour_debut.zfill(2)
            jour_fin = jour_fin.zfill(2)

            # Créer les dates
            date_debut = datetime.strptime(f"{annee}-{mois}-{jour_debut}", "%Y-%m-%d")
            date_fin = datetime.strptime(f"{annee}-{mois}-{jour_fin}", "%Y-%m-%d")

            # Vérifier la cohérence des dates
            if date_fin < date_debut:
                raise ValueError("La date de fin est antérieure à la date de début")

            print(f"✅ Période trouvée : du {date_debut.strftime('%A %d %B %Y')} au {date_fin.strftime('%A %d %B %Y')}")
            return date_debut.date(), date_fin.date()

        except ValueError as e:
            raise ValueError(f"Erreur lors de la création des dates : {e}")

    except Exception as e:
        print(f"❌ Erreur lors de l'extraction des dates : {e}")
        # En cas d'échec, on peut retourner des dates par défaut ou lever une exception
        raise ValueError("❌ Impossible de déterminer la période de garde")

# Modification de la fonction insert_to_supabase
def insert_to_supabase(pharmacies):
    """Insère ou met à jour les pharmacies dans Supabase."""
    try:
        # Préparation des données
        pharmacy_records = [{
            "nom": pharmacy["name"],
            "adresse": pharmacy["adresse"],
            "latitude": pharmacy["latitude"],
            "longitude": pharmacy["longitude"],
            "telephone": ", ".join(pharmacy["phones"]) if pharmacy.get("phones") else "",
            "horaires": pharmacy["horaires"],
            "date_debut_garde": pharmacy["date_debut_garde"],
            "date_fin_garde": pharmacy["date_fin_garde"]
        } for pharmacy in pharmacies]
        
        # Tentative d'insertion avec plus de détails sur l'erreur
        try:
            result = supabase.table("pharmacies_de_garde").upsert(pharmacy_records).execute()
            print(f"✅ {len(pharmacy_records)} pharmacies synchronisées avec Supabase")
            return True
        except Exception as e:
            print(f"Détails de l'erreur Supabase : {str(e)}")
            return False
                
    except Exception as e:
        print(f"❌ Erreur Supabase : {e}")
        return False

def extract_pharmacies(content):
    """Extrait les informations des pharmacies de garde depuis le contenu PDF."""
    pharmacies = []
    try:
        date_debut, date_fin = extract_week_dates(content)
        
        # Pattern amélioré pour capturer toute l'information
        pharmacy_pattern = r"""
            (?:PHCIE|PHARMACIE)\s+
            ([^/-]+?)                       # Nom de la pharmacie
            \s*[-/]\s*                      # Séparateur (- ou /)
            ([^-]*?)                        # Adresse complète
            \s+(?:[-–]\s*)?TEL\.?\s*       # Marqueur de téléphone
            ([0-9\s/.-]+)                   # Numéros de téléphone
            (?:\s*HORAIRES?\s*:?\s*
                ([^/\n]*)                   # Horaires
            )?
        """
        
        matches = re.finditer(pharmacy_pattern, content, re.VERBOSE | re.IGNORECASE)
        
        for match in matches:
            try:
                # Extraction des données
                pharmacy_name = match.group(1).strip()
                address_info = match.group(2).strip()
                phone_raw = match.group(3).strip()
                horaires = match.group(4).strip() if match.group(4) else "24h/24"

                # Debug
                print(f"\n=== Extraction pharmacie ===")
                print(f"Nom: {pharmacy_name}")
                print(f"Adresse brute: {address_info}")
                print(f"Téléphone brut: {phone_raw}")

                # Si le nom est invalide, on saute
                if not pharmacy_name or len(pharmacy_name) < 3:
                    print(f"⚠️ Nom invalide ignoré: {pharmacy_name}")
                    continue

                # Nettoyage des données
                pharmacy_name = re.sub(r'\s+', ' ', pharmacy_name)
                address_info = re.sub(r'\s+', ' ', address_info)
                
                # Extraction des numéros
                phone_numbers = extract_phone_numbers(phone_raw)
                
                # Récupération des coordonnées
                latitude, longitude = None, None
                if address_info:
                    full_address = f"{pharmacy_name}, {address_info}"
                    latitude, longitude = get_coordinates_from_address(full_address)

                # Création de l'objet pharmacie
                pharmacy = {
                    "name": pharmacy_name,
                    "adresse": address_info,
                    "phones": phone_numbers,
                    "latitude": latitude,
                    "longitude": longitude,
                    "horaires": horaires,
                    "date_debut_garde": date_debut.strftime('%Y-%m-%d'),
                    "date_fin_garde": date_fin.strftime('%Y-%m-%d')
                }

                # Vérification des données essentielles
                if not address_info:
                    print(f"⚠️ Adresse manquante pour {pharmacy_name}")
                if not phone_numbers:
                    print(f"⚠️ Téléphone manquant pour {pharmacy_name}")
                if not latitude or not longitude:
                    print(f"⚠️ Coordonnées manquantes pour {pharmacy_name}")

                pharmacies.append(pharmacy)
                print(f"✅ Pharmacie extraite avec succès: {pharmacy_name}")
                print(f"   📍 Coordonnées: {latitude}, {longitude}")
                print(f"   📞 Téléphones: {', '.join(phone_numbers)}")
                print(f"   📍 Adresse: {address_info}")

            except Exception as e:
                print(f"❌ Erreur lors du traitement de la pharmacie: {str(e)}")
                continue

        return pharmacies

    except Exception as e:
        print(f"❌ Erreur globale: {str(e)}")
        return []

def save_to_json(data, filepath):
    """Sauvegarde les données dans un fichier JSON."""
    try:
        # Création du dossier data s'il n'existe pas
        os.makedirs(os.path.dirname(filepath), exist_ok=True)  # Correction de 'existant' à 'exist_ok'
        
        # Sauvegarde des données en JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        print(f"✅ Données sauvegardées dans {filepath}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde des données : {e}")

def main():
    pdf_path = 'C:\\Users\\hp\\Desktop\\pharmago_main\\backend\\data\\garde-fevrier-2025.pdf'
    extracted_text = extract_pdf_content(pdf_path)
    
    if not extracted_text:
        print("❌ Aucun texte extrait du PDF")
        return

    all_pharmacies = []
    for page_content in extracted_text:
        pharmacies = extract_pharmacies(page_content)
        all_pharmacies.extend(pharmacies)

    if all_pharmacies:
        # Sauvegarde locale en JSON (optionnel, pour debug)
        save_to_json(all_pharmacies, DATA_FILE)
        
        # Insertion dans Supabase
        if insert_to_supabase(all_pharmacies):
            print("✅ Processus terminé avec succès")
        else:
            print("❌ Erreur lors de la synchronisation avec Supabase")
    else:
        print("⚠️ Aucune pharmacie trouvée dans le PDF")

if __name__ == "__main__":
    main()
