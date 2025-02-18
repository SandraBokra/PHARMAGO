import os
import psycopg2
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

# Charger le .env depuis la racine du projet
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app.log'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Crée et retourne une connexion à la base de données"""
    try:
        print(f"Tentative de connexion avec:")
        print(f"DB: {os.getenv('DB_DATABASE')}")
        print(f"User: {os.getenv('DB_USER')}")
        print(f"Host: {os.getenv('DB_HOST')}")
        print(f"Port: {os.getenv('DB_PORT')}")
        
        connection = psycopg2.connect(
            dbname=os.getenv('DB_DATABASE'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT', 5432),
            cursor_factory=RealDictCursor  # Retourne les résultats comme des dictionnaires
        )
        return connection
    except Exception as e:
        print(f"Erreur de connexion détaillée: {str(e)}")
        raise

def load_pharmacies():
    """Charge toutes les pharmacies"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Vérifier si la table existe
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'pharmacies_de_garde'
            );
        """)
        table_exists = cur.fetchone()['exists']
        if not table_exists:
            print("❌ La table pharmacies_de_garde n'existe pas!")
            return None

        print("📊 Exécution de la requête...")
        cur.execute("""
            SELECT * FROM pharmacies_de_garde
            ORDER BY nom ASC;
        """)
        
        pharmacies = cur.fetchall()
        print(f"📋 Nombre de pharmacies trouvées : {len(pharmacies)}")
        
        result = []
        for row in pharmacies:
            result.append({
                'id': row['id'],
                'nom': row['nom'],
                'adresse': row['adresse'],
                'latitude': float(row['latitude']) if row['latitude'] else None,
                'longitude': float(row['longitude']) if row['longitude'] else None,
                'telephone': row['telephone'],  # Vérifier que cette colonne existe
                'horaires': row['horaires'],
                'isDeGarde': row['date_de_garde'] == datetime.now().date(),
                'date_de_garde': row['date_de_garde'].isoformat() if row['date_de_garde'] else None
            })

        cur.close()
        conn.close()
        return result

    except Exception as e:
        print(f"❌ Erreur détaillée dans load_pharmacies: {str(e)}")
        return None

@app.route('/api/pharmacies-de-garde', methods=['GET'])
def get_pharmacies_de_garde():
    """Retourne les pharmacies de garde"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Vérification de la table
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'pharmacies_de_garde'
            );
        """)
        table_exists = cur.fetchone()['exists']
        
        if not table_exists:
            # Créer la table si elle n'existe pas
            cur.execute("""
                CREATE TABLE pharmacies_de_garde (
                    id SERIAL PRIMARY KEY,
                    nom VARCHAR(255) NOT NULL,
                    adresse VARCHAR(255),
                    latitude DECIMAL(10,8),
                    longitude DECIMAL(11,8),
                    telephone VARCHAR(100),
                    horaires VARCHAR(100),
                    date_de_garde DATE
                );
            """)
            conn.commit()
            print("✅ Table créée avec succès")
        
        # Vérifier le contenu
        cur.execute("SELECT COUNT(*) FROM pharmacies_de_garde")
        count = cur.fetchone()['count']
        print(f"Nombre d'enregistrements: {count}")

        if count == 0:
            return jsonify({
                "status": "success",
                "message": "La table est vide",
                "count": 0,
                "pharmacies": []
            })

        pharmacies = load_pharmacies()
        return jsonify({
            "status": "success",
            "count": len(pharmacies) if pharmacies else 0,
            "pharmacies": pharmacies or []
        })

    except Exception as e:
        print(f"Erreur détaillée: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Erreur: {str(e)}"
        }), 500

@app.route('/api/pharmacie/<int:id>', methods=['GET'])
def get_pharmacie(id):
    """Retourne les détails d'une pharmacie spécifique"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT *
            FROM pharmacies_de_garde
            WHERE id = %s
        """
        
        cur.execute(query, (id,))
        pharmacie = cur.fetchone()
        
        cur.close()
        conn.close()

        if pharmacie is None:
            return jsonify({"status": "error", "message": "Pharmacie non trouvée"}), 404

        return jsonify({"status": "success", "pharmacie": pharmacie})

    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la pharmacie {id}: {e}")
        return jsonify({
            "status": "error",
            "message": "Une erreur est survenue"
        }), 500

@app.route('/api/test-db', methods=['GET'])
def test_db_connection():
    """Test la connexion à la base de données"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT 1')
        cur.close()
        conn.close()
        return jsonify({"status": "success", "message": "Database connection successful"})
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Démarrage du serveur sur le port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
