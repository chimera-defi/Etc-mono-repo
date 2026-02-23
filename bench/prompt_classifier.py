"""
Prompt Complexity Classifier

Ports the TypeScript classifier from clawd-throttle to Python.
Scores prompts on multiple complexity dimensions and returns tier: simple/standard/complex.
"""

import re
import math
from typing import Optional


# Default weights matching the TypeScript implementation
DEFAULT_WEIGHTS = {
    'tokenCount': 0.10,
    'codePresence': 0.20,
    'reasoningMarkers': 0.22,
    'simpleIndicators': -0.15,
    'multiStepPatterns': 0.18,
    'questionCount': 0.06,
    'systemPromptSignals': 0.09,
    'conversationDepth': 0.10,
    'agenticTask': 0.02,
    'technicalTerms': 0.05,
    'constraintCount': 0.03,
    'escalationSignals': 0.12,
    'multiLanguageCode': 0.08,
}

# Default thresholds (matching TypeScript implementation)
DEFAULT_SIMPLE_MAX = 0.18
DEFAULT_COMPLEX_MIN = 0.50  # Original threshold from clawd-throttle


def interpolate_breakpoints(value: float, breakpoints: list[tuple[float, float]]) -> float:
    """Interpolate score based on breakpoints."""
    if value <= breakpoints[0][0]:
        return breakpoints[0][1]
    if value >= breakpoints[-1][0]:
        return breakpoints[-1][1]

    for i in range(len(breakpoints) - 1):
        low_val, low_score = breakpoints[i]
        high_val, high_score = breakpoints[i + 1]
        if low_val <= value <= high_val:
            ratio = (value - low_val) / (high_val - low_val)
            return low_score + ratio * (high_score - low_score)

    return breakpoints[-1][1]


def score_token_count(text: str) -> float:
    """Score based on token count (estimated)."""
    estimated_tokens = (len(text) + 3) // 4  # ~4 chars per token

    breakpoints = [
        (50, 0.00),
        (200, 0.15),
        (500, 0.30),
        (1000, 0.50),
        (3000, 0.70),
        (8000, 0.85),
        (16000, 1.00),
    ]
    return interpolate_breakpoints(estimated_tokens, breakpoints)


def score_code_presence(text: str) -> float:
    """Score based on code presence indicators."""
    score = 0.0

    # Fenced code blocks
    fenced_blocks = len(re.findall(r'```[\s\S]*?```', text))
    score += min(0.60, fenced_blocks * 0.30)

    # Inline code
    inline_code = len(re.findall(r'`[^`]+`', text))
    score += min(0.20, inline_code * 0.05)

    # Code keywords
    keywords = len(re.findall(
        r'\b(function|const|let|var|class|import|export|return|async|await|def|fn|pub|struct|impl|enum|interface|type|module|require|yield|throw|catch|try|finally|for|while|if|else|switch|case)\b',
        text
    ))
    score += min(0.30, keywords * 0.03)

    # Syntax characters
    syntax_chars = len(re.findall(r'[{}\[\]();=><|&]', text))
    score += min(0.20, syntax_chars * 0.005)

    # File extensions
    file_exts = len(re.findall(
        r'\.\b(ts|tsx|js|jsx|py|rs|go|java|cpp|c|rb|sh|sql|css|html|json|yaml|yml|toml|xml)\b',
        text
    ))
    score += min(0.30, file_exts * 0.10)

    return min(1.0, score)


def score_reasoning_markers(text: str) -> float:
    """Score based on reasoning/analysis markers."""
    score = 0.0

    # Analytical terms
    analytical_hits = len(re.findall(
        r'\b(explain|analyze|compare|evaluate|assess|critique|reason|trade-?offs?|pros?\s+and\s+cons?|implications?|consequences?|consider|weigh|differentiate|contrast|justify)\b',
        text, re.IGNORECASE
    ))
    score += min(0.50, analytical_hits * 0.08)

    # Chain of thought
    cot_hits = len(re.findall(
        r'\b(step[- ]by[- ]step|think through|break down|work through|let\'?s think|chain of thought|think carefully|think about this|reasoning)\b',
        text, re.IGNORECASE
    ))
    score += min(0.60, cot_hits * 0.20)

    # Debug/diagnose
    debug_hits = len(re.findall(
        r'\b(debug|diagnose|troubleshoot|root cause|investigate|figure out why|what went wrong|what\'s? causing|doesn\'t work|doesn\'t make sense|behaves differently|unexpected behavior|inconsistent)\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, debug_hits * 0.12)

    # Why/How patterns
    why_how_hits = len(re.findall(
        r'\b(why\s+(does|did|is|are|do|would|should|doesn\'t|isn\'t|can\'t))\b|\b(how\s+does|how\s+do|how\s+would|how\s+can)\b',
        text, re.IGNORECASE
    ))
    score += min(0.30, why_how_hits * 0.12)

    return min(1.0, score)


def score_simple_indicators(text: str) -> float:
    """Score based on simple prompt indicators."""
    trimmed = text.strip()

    # Very simple greetings/acknowledgments
    if re.match(r'^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|sure|got it|sounds good|great|cool|nice|yep|nope|nah)[.!?\s]*$', trimmed, re.IGNORECASE):
        return 1.0

    score = 0.0

    # Short text bonus
    if len(trimmed) < 40:
        score += 0.35
    elif len(trimmed) < 80:
        score += 0.25
    elif len(trimmed) < 150:
        score += 0.10

    # Simple task keywords
    simple_task_hits = len(re.findall(
        r'\b(translate|convert|format|summarize|tldr|tl;dr|what is|define|list|name|spell|count|repeat|echo|quote)\b',
        text, re.IGNORECASE
    ))
    score += min(0.60, simple_task_hits * 0.15)

    # Simple adjectives
    simple_adj_hits = len(re.findall(
        r'\b(quick|brief|short|simple|one-?liner|fast|easy|basic|straightforward)\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, simple_adj_hits * 0.10)

    # No question mark bonus
    if '?' not in trimmed:
        score += 0.05

    # Single sentence bonus
    sentences = re.split(r'[.!?]+', trimmed)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) <= 1 and len(trimmed) < 80:
        score += 0.10

    return min(1.0, score)


def score_multi_step_patterns(text: str) -> float:
    """Score based on multi-step patterns."""
    score = 0.0

    # Sequential markers
    seq_hits = len(re.findall(
        r'\b(first|then|next|after that|finally|lastly|step\s*\d+|phase\s*\d+|part\s*\d+)\b',
        text, re.IGNORECASE
    ))
    score += min(0.50, seq_hits * 0.10)

    # Addition markers
    add_hits = len(re.findall(
        r'\b(and then|also|additionally|furthermore|moreover|as well as|on top of that|in addition|plus)\b',
        text, re.IGNORECASE
    ))
    score += min(0.30, add_hits * 0.06)

    # Numbered items
    numbered_items = len(re.findall(r'^\s*\d+[.)]\s', text, re.MULTILINE))
    score += min(0.40, numbered_items * 0.08)

    # Bullet items
    bullet_items = len(re.findall(r'^\s*[-*+]\s', text, re.MULTILINE))
    score += min(0.30, bullet_items * 0.06)

    # Build/implement keywords
    build_hits = len(re.findall(
        r'\b(implement|build|create|design|architect|refactor|migrate|restructure|rewrite|overhaul|set up|configure|deploy|integrate)\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, build_hits * 0.10)

    return min(1.0, score)


def score_question_count(text: str) -> float:
    """Score based on question count."""
    explicit_questions = text.count('?')

    breakpoints = [
        (0, 0.00),
        (1, 0.15),
        (2, 0.30),
        (3, 0.50),
        (4, 0.70),
        (5, 0.85),
        (7, 1.00),
    ]
    score = interpolate_breakpoints(explicit_questions, breakpoints)

    # Implicit questions
    implicit_hits = len(re.findall(r'(?:^|\.\s+)(how|why|what|when|where|which|who|whom|whose)\s', text, re.IGNORECASE | re.MULTILINE))
    score += min(0.30, implicit_hits * 0.08)

    return min(1.0, score)


def score_system_prompt_signals(system_prompt: Optional[str]) -> float:
    """Score based on system prompt complexity."""
    if not system_prompt or len(system_prompt.strip()) == 0:
        return 0.0

    score = 0.0
    length = len(system_prompt)

    # Length-based scoring
    if length <= 100:
        score += 0.10
    elif length <= 500:
        score += 0.25
    elif length <= 2000:
        score += 0.45
    elif length <= 5000:
        score += 0.65
    else:
        score += 0.80

    # Structured output signals
    structured_hits = len(re.findall(
        r'\b(json|schema|structured|format:|output format|xml|markdown table|csv|typescript interface|response format)\b',
        system_prompt, re.IGNORECASE
    ))
    score += min(0.20, structured_hits * 0.08)

    # Role signals
    role_hits = len(re.findall(
        r'\b(you are|act as|your role|persona|character|behave as|you\'re a|you will act)\b',
        system_prompt, re.IGNORECASE
    ))
    score += min(0.15, role_hits * 0.08)

    # Constraint signals
    constraint_hits = len(re.findall(
        r'\b(you must|you must not|never|always|do not|don\'t|required|forbidden|mandatory|constraint|rule:|important:)\b',
        system_prompt, re.IGNORECASE
    ))
    score += min(0.15, constraint_hits * 0.04)

    return min(1.0, score)


def score_conversation_depth(message_count: Optional[int]) -> float:
    """Score based on conversation depth (message count)."""
    if message_count is None or message_count <= 1:
        return 0.0

    breakpoints = [
        (1, 0.00),
        (3, 0.10),
        (6, 0.25),
        (10, 0.45),
        (20, 0.65),
        (50, 0.85),
        (100, 1.00),
    ]
    return interpolate_breakpoints(message_count, breakpoints)


def score_agentic_task(text: str) -> float:
    """Score based on agentic/multi-step autonomous task patterns."""
    score = 0.0

    # Research patterns
    research_hits = len(re.findall(
        r'\b(research\s+(and|the|this|about|into|on)|compare\s+(options|approaches|alternatives|solutions|methods))\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, research_hits * 0.15)

    # Autonomy patterns
    autonomy_hits = len(re.findall(
        r'\b(find out|scrape|monitor|collect data|gather information|look up|search for|crawl|fetch data)\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, autonomy_hits * 0.12)

    # Iteration patterns
    iteration_hits = len(re.findall(
        r'\b(iterate until|keep trying|fix and retry|until it works|try again|repeat until|loop until|retry if)\b',
        text, re.IGNORECASE
    ))
    score += min(0.50, iteration_hits * 0.20)

    # Multi-chain patterns
    multi_chain_hits = len(re.findall(r'\bafter that\b.*\band also\b|\bstep\s+\d+\b.*\bstep\s+\d+', text, re.IGNORECASE))
    score += min(0.30, multi_chain_hits * 0.15)

    return min(1.0, score)


def score_technical_terms(text: str) -> float:
    """Score based on technical terminology density."""
    technical_terms = [
        r'\balgorithm\b', r'\bkubernetes\b', r'\bk8s\b', r'\bdocker\b', r'\bcontainer\b',
        r'\bAPI\b', r'\bdatabase\b', r'\bmicroservices?\b', r'\bOAuth\b', r'\bJWT\b',
        r'\bGraphQL\b', r'\bREST\b', r'\bgRPC\b', r'\bWebSocket\b', r'\bCI/CD\b',
        r'\bterraform\b', r'\bnginx\b', r'\bredis\b', r'\bpostgres\b', r'\bmongoDB\b',
        r'\bkafka\b', r'\bRabbitMQ\b', r'\belasticsearch\b', r'\blambda\b', r'\bserverless\b',
        r'\bCDN\b', r'\bDNS\b', r'\bTLS\b', r'\bSSL\b', r'\bSSH\b',
        r'\bHTTP\b', r'\bTCP\b', r'\bUDP\b', r'\bCORS\b', r'\bCSRF\b', r'\bXSS\b',
        r'\bSQL\b', r'\bNoSQL\b', r'\bORM\b', r'\bSDK\b', r'\bCLI\b', r'\bregex\b',
        r'\bmutex\b', r'\bsemaphore\b', r'\bdeadlock\b', r'\bthread\b', r'\bprocess\b',
        r'\bkernel\b', r'\bsyscall\b', r'\bcache\b', r'\bindex\b', r'\bshard\b',
        r'\breplica\b', r'\bpartition\b', r'\blobal\b', r'\bauto.scal\b', r'\bcircuit.break\b',
        r'\bproduction\b', r'\bstaging\b', r'\brace.condition\b', r'\bvulnerability\b',
        r'\bsecurity.audit\b', r'\bmemory.leak\b', r'\bstack.overflow\b', r'\bsegfault\b',
        r'\bcore.dump\b', r'\bunder.load\b',
    ]

    hits = sum(len(re.findall(term, text, re.IGNORECASE)) for term in technical_terms)

    breakpoints = [
        (0, 0.00),
        (1, 0.15),
        (2, 0.30),
        (4, 0.55),
        (6, 0.75),
        (10, 0.90),
        (15, 1.00),
    ]
    return interpolate_breakpoints(hits, breakpoints)


def score_escalation_signals(text: str) -> float:
    """Score based on escalation/frustration signals."""
    score = 0.0

    # Retry language
    retry_hits = len(re.findall(
        r'\b(try again|tried|still not working|didn\'t work|not working|broken|can\'t get .+ to work)\b',
        text, re.IGNORECASE
    ))
    score += min(0.50, retry_hits * 0.15)

    # Failure language
    failure_hits = len(re.findall(
        r'\b(failed|failing|failure|errors?|crash|crashes|crashing|keeps? (?:failing|crashing|breaking))\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, failure_hits * 0.12)

    # Stuck language
    stuck_hits = len(re.findall(
        r'\b(stuck|blocked|at a loss|can\'t figure out|no idea what|none of these work|nothing works|out of ideas|give up|last resort|help me)\b',
        text, re.IGNORECASE
    ))
    score += min(0.50, stuck_hits * 0.18)

    # Previous attempt reference
    previous_hits = len(re.findall(
        r'\b(previous approach|previous attempt|previous solution|earlier suggestion|already tried|we tried|I tried|your suggestion didn\'t)\b',
        text, re.IGNORECASE
    ))
    score += min(0.40, previous_hits * 0.15)

    return min(1.0, score)


def score_constraint_count(text: str) -> float:
    """Score based on constraint/precision language."""
    hits = len(re.findall(
        r'\b(at most|at least|exactly|no more than|no fewer than|O\([^)]+\)|within\s+\d+|maximum|minimum|limit to|budget of|constraint|bounded by|not exceed|upper bound|lower bound|threshold|cap at|floor of|ceiling of)\b',
        text, re.IGNORECASE
    ))

    breakpoints = [
        (0, 0.00),
        (1, 0.20),
        (2, 0.40),
        (3, 0.60),
        (5, 0.80),
        (7, 1.00),
    ]
    return interpolate_breakpoints(hits, breakpoints)


def score_multi_language_code(text: str) -> float:
    """Score based on multi-language coding patterns."""
    score = 0.0

    # Language patterns
    lang_patterns = [
        (r'\b(import\s+\{|export\s+(default|const|function|class|async))\b', 'ts'),
        (r'\b(def\s+\w+|class\s+\w+:\s*|import\s+\w+$)\b', 'python'),
        (r'\b(fn\s+\w+|let\s+mut|impl\s+\w+|pub\s+fn)\b', 'rust'),
        (r'\b(func\s+\w+|package\s+\w+|type\s+\w+\s+struct)\b', 'go'),
        (r'\b(public\s+class|private\s+|void\s+\w+\(|System\.out)\b', 'java'),
        (r'\b(#include|int\s+main\(|std::|cout\s*<<)\b', 'cpp'),
        (r'\b(<\?php|function\s+\w+\(|\$\w+\s*=)\b', 'php'),
        (r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE)\b', 'sql'),
        (r'\b(<\w+>|<\/\w+>|<!DOCTYPE|div\s+class)\b', 'html'),
    ]

    detected = set()
    for pattern, lang in lang_patterns:
        if re.search(pattern, text):
            detected.add(lang)

    # Score based on different languages detected
    score = min(1.0, len(detected) * 0.25)

    # Bonus for coding task keywords
    keyword_hits = len(re.findall(
        r'\b(refactor|migrate|port|convert|translate|parse|serialize|deserialize|lint|format|build|compile|test|debug)\b',
        text, re.IGNORECASE
    ))
    score += min(0.3, keyword_hits * 0.1)

    return min(1.0, score)


def calibrate_confidence(
    composite: float,
    tier: str,
    simple_max: float,
    complex_min: float,
    steepness: float = 10.0
) -> float:
    """Sigmoid confidence calibration."""
    if tier == 'simple':
        distance = simple_max - composite
    elif tier == 'complex':
        distance = composite - complex_min
    else:
        # Standard: distance from nearest boundary
        distance = min(composite - simple_max, complex_min - composite)

    return 1 / (1 + math.exp(-steepness * distance))


def classify_prompt(
    text: str,
    message_count: Optional[int] = None,
    system_prompt: Optional[str] = None,
    weights: Optional[dict] = None,
    simple_max: float = DEFAULT_SIMPLE_MAX,
    complex_min: float = DEFAULT_COMPLEX_MIN,
) -> dict:
    """
    Classify a prompt into complexity tier: simple/standard/complex.

    Args:
        text: The prompt text
        message_count: Optional conversation message count
        system_prompt: Optional system prompt
        weights: Optional custom dimension weights
        simple_max: Threshold for simple tier (default 0.18)
        complex_min: Threshold for complex tier (default 0.65)

    Returns:
        Dictionary with tier, score, confidence, and dimension scores
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    # Calculate all dimension scores
    dimensions = {
        'tokenCount': score_token_count(text),
        'codePresence': score_code_presence(text),
        'reasoningMarkers': score_reasoning_markers(text),
        'simpleIndicators': score_simple_indicators(text),
        'multiStepPatterns': score_multi_step_patterns(text),
        'questionCount': score_question_count(text),
        'systemPromptSignals': score_system_prompt_signals(system_prompt),
        'conversationDepth': score_conversation_depth(message_count),
        'agenticTask': score_agentic_task(text),
        'technicalTerms': score_technical_terms(text),
        'constraintCount': score_constraint_count(text),
        'escalationSignals': score_escalation_signals(text),
        'multiLanguageCode': score_multi_language_code(text),
    }

    # Calculate composite score
    composite = sum(dimensions[key] * weights[key] for key in weights)
    composite = max(0.0, min(1.0, composite))

    # Determine tier
    if composite <= simple_max:
        tier = 'simple'
    elif composite >= complex_min:
        tier = 'complex'
    else:
        tier = 'standard'

    # Calculate confidence
    confidence = calibrate_confidence(composite, tier, simple_max, complex_min)

    return {
        'tier': tier,
        'score': round(composite, 4),
        'confidence': round(confidence, 4),
        'dimensions': {k: round(v, 4) for k, v in dimensions.items()},
    }


# CLI for testing
if __name__ == '__main__':
    import sys

    test_prompts = [
        ("What is 2+2?", "Simple prompt"),
        ("Write a Python function to calculate fibonacci numbers", "Complex prompt"),
    ]

    if len(sys.argv) > 1:
        # Use command line argument as prompt
        test_prompts = [(sys.argv[1], "CLI prompt")]

    for prompt, description in test_prompts:
        result = classify_prompt(prompt)
        print(f"\n{description}:")
        print(f"  Prompt: {prompt[:60]}{'...' if len(prompt) > 60 else ''}")
        print(f"  Tier: {result['tier']}")
        print(f"  Score: {result['score']}")
        print(f"  Confidence: {result['confidence']}")
