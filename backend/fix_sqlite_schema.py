import sqlite3
import os

DB_PATH = 'backend/cam.db'

def fix_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    tables = [
        'real_estate_properties',
        'design_architecture_properties',
        'construction_properties',
        'interiors_properties'
    ]

    create_sql = """
    CREATE TABLE IF NOT EXISTS {table} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        estimated_cost TEXT NOT NULL,
        description TEXT NOT NULL,
        main_image TEXT NOT NULL,
        sub_images TEXT,
        status TEXT DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """

    try:
        for table in tables:
            print(f"Processing table: {table}")
            # Drop existing table (to clear legacy schema mismatch)
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"Dropped {table}")

            # Create with correct schema
            sql = create_sql.format(table=table)
            cursor.execute(sql)
            print(f"Created {table} with correct schema")

        # Also verify 'projects' has main_image (from previous task context)
        # Check if column exists
        cursor.execute("PRAGMA table_info(projects)")
        cols = [info[1] for info in cursor.fetchall()]
        if 'main_image' not in cols:
            print("Adding missing main_image column to projects table...")
            cursor.execute("ALTER TABLE projects ADD COLUMN main_image TEXT")
            print("Added main_image to projects")

        conn.commit()
        print("Schema fix applied successfully.")

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_schema()
