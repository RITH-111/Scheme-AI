# Scheme AI

Scheme AI is an open-source, AI-powered platform that helps citizens discover and access government welfare schemes with clarity and confidence.

Many people miss out on benefits because schemes are difficult to find, understand, or apply for. Scheme AI bridges this gap by aggregating scheme information from multiple sources and presenting it in a clear, personalized, and action-oriented experience.

## Why Scheme AI

- Improves awareness of welfare opportunities
- Reduces confusion around eligibility and application processes
- Helps users act faster with step-by-step guidance
- Supports inclusive access for people with limited technical knowledge

## Core Capabilities

- Personalized scheme recommendations using profile inputs such as age, income level, occupation, location, and social category
- Simplified explanation of complex eligibility criteria
- Guided, step-by-step application support
- Timely updates on scheme changes and deadlines

## How It Works

1. A user shares relevant profile details.
2. The recommendation engine analyzes eligibility context.
3. Scheme AI surfaces the most relevant welfare schemes.
4. The platform explains eligibility in plain language.
5. Users receive practical, sequential guidance to apply.

## Open Source Mission

Scheme AI is built as a community-driven project. Developers, researchers, and organizations can contribute to:

- Expand scheme coverage
- Improve recommendation quality
- Strengthen transparency and trust
- Build better tools for inclusive public service delivery

Our goal is an ecosystem where every citizen can easily discover and claim the benefits they deserve.

## Project Structure

- `Frontend/` - User interface and client application
- `Backend/` - API services, recommendation logic, and data workflows

## Getting Started

### Backend

1. Copy `Backend/.env.example` to `Backend/.env`
2. Install dependencies:
   ```bash
   pip install -r Backend/requirements.txt
   ```
3. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd Frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome. If you want to improve features, add coverage, fix bugs, or enhance documentation, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
