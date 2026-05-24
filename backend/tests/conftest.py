import sys
from pathlib import Path

# Add backend/ to path so tests can `import main`, `import scoring`
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
