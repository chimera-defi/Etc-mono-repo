.PHONY: bench-smoke bench-tests setup-gstack setup-gstack-shared sync-gstack-siblings workflow-pr-check

bench-tests:
	python3 bench/ops/test_route_trace_report.py
	python3 bench/selfopt/test_supervisor_parsing.py

setup-gstack:
	bash scripts/setup-gstack.sh

setup-gstack-shared:
	bash scripts/skills/install-gstack-shared.sh

sync-gstack-siblings:
	bash scripts/skills/sync-gstack-to-sibling-repos.sh

workflow-pr-check:
	bash scripts/workflow/check-pr-readiness.sh

bench-smoke: bench-tests
	bash -n bench/ops/reproduce_pr245.sh
	python3 -m py_compile bench/ops/route_trace_report.py bench/selfopt/baseline_tracker.py bench/selfopt/benchmark_supervisor.py
	cd bench && PYTHONPATH=. python3 selfopt/benchmark_supervisor.py --models lfm2.5-thinking:1.2b --phases atomic --timeout 90 --max-retries 1
	cd bench && python3 ops/route_trace_report.py --one-line
