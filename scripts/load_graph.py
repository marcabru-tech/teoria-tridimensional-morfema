"""
Script to migrate JSON data to Neo4j.
"""

import json
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ttm.db.graph import Neo4jClient

def load_hebrew_roots(client: Neo4jClient, filepath: str):
    """Load Hebrew roots from JSON."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loading {len(data['roots'])} Hebrew roots...")
    
    for item in data["roots"]:
        root = item["root"]
        meaning = item.get("meaning", "")
        
        # Create Root
        client.create_root(root, "he", meaning)
        
        # Semantic Fields
        for field in item.get("semantic_fields", []):
            client.add_semantic_field(root, "he", field)
            
        # Derived Morphemes (mock data generation for now as JSON only has examples)
        if "derived_forms" in item:
            for deriv in item["derived_forms"]:
                # In a real scenario, we would parse full attributes
                client.create_morpheme(
                    form=deriv["form"],
                    root=root,
                    language="he",
                    attributes={"gloss": deriv.get("gloss", "")}
                )

def main():
    # Helper to wait for DB?? For now assume it's up
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    print(f"Connecting to Neo4j at {uri}...")
    try:
        client = Neo4jClient(uri=uri, password=password)
        client.create_constraints()
        
        # Load Hebrew
        hebrew_path = os.path.join("data", "roots", "hebrew_roots.json")
        if os.path.exists(hebrew_path):
            load_hebrew_roots(client, hebrew_path)
            
        # Load Arabic (if exists)
        arabic_path = os.path.join("data", "roots", "arabic_roots.json")
        if os.path.exists(arabic_path):
            # Reuse logic or create specific loader
            pass 
            
        print("Migration complete!")
        client.close()
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
