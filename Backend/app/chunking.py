def create_chunks(scheme):
    chunks = []

    name = scheme.get("scheme_name", "")
    details = scheme.get("details", "")
    benefits = scheme.get("benefits", "")
    eligibility = scheme.get("eligibility", "")
    documents = scheme.get("documents_required", "")
    process = scheme.get("application_process", "")

    if details:
        chunks.append({
            "text": f"Scheme: {name}\nDetails: {details}",
            "metadata": {"scheme_name": name, "section": "details"}
        })

    if eligibility:
        chunks.append({
            "text": f"Scheme: {name}\nEligibility: {eligibility}",
            "metadata": {"scheme_name": name, "section": "eligibility"}
        })

    if benefits:
        chunks.append({
            "text": f"Scheme: {name}\nBenefits: {benefits}",
            "metadata": {"scheme_name": name, "section": "benefits"}
        })

    if documents:
        chunks.append({
            "text": f"Scheme: {name}\nDocuments Required: {documents}",
            "metadata": {"scheme_name": name, "section": "documents"}
        })

    if process:
        chunks.append({
            "text": f"Scheme: {name}\nApplication Process: {process}",
            "metadata": {"scheme_name": name, "section": "process"}
        })

    return chunks