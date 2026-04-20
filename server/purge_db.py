import sqlite3

def clean():
    conn = sqlite3.connect('data/app.db')
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cursor.fetchall() if t[0] != 'alembic_version']
    print(f"Existing tables: {tables}")
    
    # Tables to clear (ordering matters for foreign keys)
    to_clear = [
        'notifications', 
        'subscriptions', 
        'concert_performers', 
        'performers', 
        'concerts'
    ]
    
    for table in to_clear:
        if table in tables:
            print(f"Purging {table}...")
            cursor.execute(f"DELETE FROM {table}")
    
    # Keep only AB and Trix
    print("Removing excess venues...")
    cursor.execute("DELETE FROM venues WHERE id NOT IN (1, 2)")
    
    conn.commit()
    conn.close()
    print("Data purged. Registry cleaned.")

if __name__ == "__main__":
    clean()
