# worker.py - Redirects tasks to Multi-Agent Orchestrator Engine

from apps.api.app.workers.orchestrator import run_orchestrator

def run_case_analysis_pipeline(case_id: str):
    """Proxies request to the main AI Agent Orchestrator."""
    run_orchestrator(case_id)
