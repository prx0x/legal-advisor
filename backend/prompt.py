def get_legal_prompt(text_import:str) -> str:
    return f"""
        You are an expert legal AI assistant. Review the following contract and identify any risky, unfair, or predatory clauses.
        Extract the clauses and categorize them into Red, Yellow, or Green risk levels.
        Provide a plain English explanation and a suggested counter-proposal for risky clauses.
        Contract Text:
        {text_import}
    """