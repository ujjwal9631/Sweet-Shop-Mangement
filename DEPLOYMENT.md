# Deployment Guide

This guide describes how to deploy the Sweet Shop Management System.

## Prerequisites

- [GitHub Account](https://github.com/)
- [Render Account](https://render.com/) (for Backend)
- [Vercel Account](https://vercel.com/) (for Frontend)

## 1. Backend Deployment (Render)

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Select the `backend` directory when asked for "Root Directory" (if applicable, otherwise you might need to configure the build execution path).
    *   **Name**: `sweetshop-backend` (or similar)
    *   **Region**: Choose closest to you
    *   **Branch**: `main` (or your working branch)
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: `Docker` (Render should auto-detect the `Dockerfile` in `backend/`)
    *   **Instance Type**: Free (or as needed)
5.  **Environment Variables**:
    Add the following environment variables in the "Environment" tab:
    *   `PORT`: `8080`
    *   `DB_URL`: Your MySQL Database URL (e.g., from Render's implementation of MySQL or an external provider like Railway/PlanetScale).
        *   *Format*: `jdbc:mysql://<host>:<port>/<database>`
    *   `DB_USERNAME`: Your Database Username
    *   `DB_PASSWORD`: Your Database Password
    *   `JWT_SECRET`: A long random string (e.g., generated via `openssl rand -base64 32`)
    *   `JWT_EXPIRATION`: `604800000` (7 days)
    *   `CORS_ALLOWED_ORIGINS`: `https://your-vercel-frontend-url.vercel.app` (You will update this after deploying the frontend).

6.  Click **Create Web Service**.
7.  Wait for the build to finish. Once deployed, copy the **onrender.com URL** (e.g., `https://sweetshop-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the **Project Settings**:
    *   **Framework Preset**: Create React App (should be auto-detected)
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   `REACT_APP_API_URL`: The Backend URL you got from Render (e.g., `https://sweetshop-backend.onrender.com/api`).
        *   **Important**: Make sure to append `/api` if your backend routes are prefixed with it (check your controller mappings). Based on the code, the `ApiService` expects the base URL.
6.  Click **Deploy**.

## 3. Final Connection

1.  Once the Frontend is deployed, copy the **Vercel URL** (e.g., `https://sweetshop-frontend.vercel.app`).
2.  Go back to your **Render Backend Dashboard** -> **Environment**.
3.  Update `CORS_ALLOWED_ORIGINS` to match your Vercel URL exactly (no trailing slash).
4.  **Save Changes**. Render will redeploy the backend.
