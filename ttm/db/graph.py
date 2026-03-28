"""
Graph database client for TTM using Neo4j.
"""

import logging
import os
from typing import List, Dict, Any

from neo4j import GraphDatabase
from neo4j.exceptions import ClientError

logger = logging.getLogger(__name__)


class Neo4jClient:
    """Client for interacting with the Neo4j graph database."""

    def __init__(
        self,
        uri: str = "",
        user: str = "",
        password: str = "",
    ):
        uri = uri or os.environ.get("NEO4J_URI", "bolt://localhost:7687")
        user = user or os.environ.get("NEO4J_USER", "neo4j")
        password = password or os.environ.get("NEO4J_PASSWORD", "")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        """Close the database connection."""
        self.driver.close()

    def create_constraints(self):
        """Create uniqueness constraints for the graph (idempotent)."""
        constraints = [
            "CREATE CONSTRAINT FOR (r:Root) REQUIRE r.id IS UNIQUE",
            "CREATE CONSTRAINT FOR (m:Morpheme) REQUIRE m.form IS UNIQUE",
            "CREATE CONSTRAINT FOR (s:SemanticField) REQUIRE s.name IS UNIQUE",
        ]
        with self.driver.session() as session:
            for cypher in constraints:
                try:
                    session.run(cypher)
                except ClientError as exc:
                    # Neo4j raises ClientError when the constraint already exists.
                    msg = str(exc).lower()
                    if "already exists" in msg or "equivalent" in msg:
                        logger.debug("Constraint already exists, skipping: %s", cypher)
                    else:
                        logger.error("Failed to create constraint: %s — %s", cypher, exc)
                        raise

    def create_root(self, root: str, language: str, meaning: str = ""):
        """Create a Root node."""
        with self.driver.session() as session:
            session.run(
                """
                MERGE (r:Root {id: $language + "_" + $root})
                SET r.text = $root,
                    r.language = $language,
                    r.meaning = $meaning
                """,
                root=root,
                language=language,
                meaning=meaning,
            )

    def create_morpheme(self, form: str, root: str, language: str, attributes: Dict[str, Any]):
        """Create a Morpheme node and link to Root."""
        with self.driver.session() as session:
            session.run(
                """
                MERGE (m:Morpheme {form: $form})
                SET m.language = $language,
                    m += $attributes
                WITH m
                MATCH (r:Root {id: $language + "_" + $root})
                MERGE (m)-[:DERIVED_FROM]->(r)
                """,
                form=form,
                root=root,
                language=language,
                attributes=attributes,
            )

    def add_semantic_field(self, root: str, language: str, field_name: str):
        """Link a Root to a Semantic Field."""
        with self.driver.session() as session:
            session.run(
                """
                MATCH (r:Root {id: $language + "_" + $root})
                MERGE (s:SemanticField {name: $field_name})
                MERGE (r)-[:BELONGS_TO]->(s)
                """,
                root=root,
                language=language,
                field_name=field_name,
            )

    def get_related_roots(self, root: str, language: str) -> List[Dict[str, Any]]:
        """Find other roots that share the same semantic field."""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (r1:Root {id: $language + "_" + $root})
                    -[:BELONGS_TO]->(s:SemanticField)<-[:BELONGS_TO]-(r2:Root)
                RETURN r2.text as root, r2.language as language, s.name as field
                """,
                root=root,
                language=language,
            )
            return [record.data() for record in result]
