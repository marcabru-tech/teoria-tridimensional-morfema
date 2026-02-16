"""
Tests for Neo4j graph client.
Uses mocking to avoid needing a live database.
"""

from unittest.mock import MagicMock, patch
import sys

# Mock the neo4j module BEFORE importing ttm.db.graph
sys.modules["neo4j"] = MagicMock()

from ttm.db.graph import Neo4jClient

class TestNeo4jClient:
    def setup_method(self):
        # Patch the GraphDatabase.driver
        self.driver_patcher = patch("neo4j.GraphDatabase.driver")
        self.mock_driver_class = self.driver_patcher.start()
        self.mock_driver = MagicMock()
        self.mock_session = MagicMock()
        
        self.mock_driver_class.return_value = self.mock_driver
        self.mock_driver.session.return_value.__enter__.return_value = self.mock_session
        
        self.client = Neo4jClient()

    def teardown_method(self):
        self.client.close()
        self.driver_patcher.stop()

    def test_create_constraints(self):
        self.client.create_constraints()
        # Verify 3 constraints were created
        assert self.mock_session.run.call_count == 3
        
        calls = [args[0] for args, _ in self.mock_session.run.call_args_list]
        assert any("CONSTRAINT FOR (r:Root)" in c for c in calls)
        assert any("CONSTRAINT FOR (m:Morpheme)" in c for c in calls)

    def test_create_root(self):
        self.client.create_root("ktb", "ar", "write")
        
        self.mock_session.run.assert_called_once()
        args, kwargs = self.mock_session.run.call_args
        query = args[0]
        params = kwargs
        
        assert "MERGE (r:Root" in query
        assert params["root"] == "ktb"
        assert params["language"] == "ar"

    def test_create_morpheme(self):
        self.client.create_morpheme("kataba", "ktb", "ar", {"pos": "verb"})
        
        self.mock_session.run.assert_called_once()
        args, kwargs = self.mock_session.run.call_args
        query = args[0]
        params = kwargs
        
        assert "MERGE (m:Morpheme" in query
        assert "MERGE (m)-[:DERIVED_FROM]->(r)" in query
        assert params["form"] == "kataba"
        assert params["root"] == "ktb"
        assert params["attributes"] == {"pos": "verb"}

    def test_add_semantic_field(self):
        self.client.add_semantic_field("ktb", "ar", "writing")
        
        self.mock_session.run.assert_called_once()
        args, kwargs = self.mock_session.run.call_args
        query = args[0]
        params = kwargs
        
        assert "MERGE (s:SemanticField" in query
        assert "MERGE (r)-[:BELONGS_TO]->(s)" in query
        assert params["field_name"] == "writing"
