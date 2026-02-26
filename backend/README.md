# CONSYF - Connecting Investors Platform

CONSYF is a modern web platform built with Next.js that connects investors with investment opportunities. Our platform streamlines the investment process by providing a secure and efficient environment for investors to discover, evaluate, and engage with potential investments.

## Features


## Backend Setup

We added a Node.js backend in `../backend` (sibling of this folder).

1. Ensure XAMPP MySQL is running and create database `consyfnew`.
2. Copy `../backend/.env.example` to `../backend/.env` and set:
	- `PORT=4000`
	- `GEMINI_API_KEY=AIzaSyDBjKMmgHMMbZnNPxDBIEpsSQJFYzidvhQ`
3. Import `../backend/src/sql/schema.sql` into MySQL to create tables.
4. Start backend: `npm run dev` inside `../backend`.

## Frontend Config

Create `.env.local` in this folder with:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### New Pages

- `app/(user)/explore/page.tsx` lists posts and shows AI matches.
- `app/(user)/profile/post-section.tsx` adds a simple post form.

Posting will trigger the backend to create an embedding via Gemini and store it for matching.

- **Frontend**: Next.js 14, TypeScript, Redux
- **Styling**: Modern UI components with customizable themes
- **Authentication**: Secure user authentication system
- **State Management**: Redux with persistent storage
- **API Integration**: Axios for HTTP requests

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/XCEIN/consyf-full.git
cd consyf-nextjs
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app`: Main application pages and layouts
- `/components`: Reusable UI components
- `/contexts`: React context providers
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and configurations
- `/services`: API service integrations
- `/types`: TypeScript type definitions

## Contributing

We welcome contributions to CONSYF! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries about CONSYF, please contact us at [your-email@example.com]
