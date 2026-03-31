import json
from tqdm import tqdm
from db import get_connection


def load_data():
    with open("../data/myschemes_scraped.json", "r", encoding="utf-8") as f:
        return json.load(f)


def insert_schemes():
    data = load_data()

    conn = get_connection()
    cur = conn.cursor()

    print("🚀 Inserting data into PostgreSQL...")

    for scheme in tqdm(data):
        scheme_name = scheme.get("scheme_name", "")
        scheme_link = scheme.get("scheme_link", "")

        cur.execute(
            """
            INSERT INTO schemes (scheme_name, scheme_link, data)
            VALUES (%s, %s, %s)
            """,
            (scheme_name, scheme_link, json.dumps(scheme))
        )

    conn.commit()
    cur.close()
    conn.close()

    print("✅ Data inserted successfully!")


if __name__ == "__main__":
    insert_schemes()