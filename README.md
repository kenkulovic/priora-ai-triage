# Priora — AI medical triage prototype

**Status: Academic Prototype**

Priora is an **academic prototype**, built by a two person team for FITCC. It is **not a validated medical product** and must not be used to make clinical decisions or prioritize real patients. Individual contributions are not asserted here.

## What the code does

The React interface collects age, vital signs, a chief complaint and an optional patient name. It sends the clinical fields to a FastAPI endpoint. When a trained model is available, the API returns a suggested ESI level (1–5), per class probabilities, a confidence value and fixed explanatory text. The UI can print a report. The patient name remains in the browser for the report; it is not sent to the API. The pain slider is shown in the UI but is **not used by the current model**.

The frontend and API code are implemented. **The trained model is not included**, so `/api/triage` currently returns HTTP 503 with a missing model message. `/api/health` can run independently. The interface has a persistent ACADEMIC DEMO warning. No model accuracy or clinical performance claim is made because no reproducible evaluation output or model artifact was present in the supplied project.

## Architecture

| Layer | Implementation |
| --- | --- |
| UI | React 19, TypeScript, Vite, Tailwind CSS |
| API | Python, FastAPI, Pydantic, Uvicorn |
| ML | scikit-learn preprocessing pipeline and XGBoost classifier |

`frontend/src/api/triage.ts` sends a POST to `/api/triage`. `backend/app/routes/triage.py` validates the request and calls `backend/ml/predict.py`. The inference pipeline expects `backend/ml/triage_model.joblib`. Training code in `backend/ml/train_real.py` maps age, six vital measurements and one chief complaint from `backend/ml/data/5v_cleandf.rdata`. It converts temperature from Fahrenheit to Celsius, imputes/scales numeric features, imputes/one-hot encodes the complaint, trains an XGBoost classifier with a stratified 80/20 split, and prints accuracy/classification metrics before saving a model. This is a single holdout evaluation in code, not a reproduced result or clinical validation; the dataset and model are absent.

## Run locally

Use Python 3.11 for the pinned packages in `backend/requirements.txt`, plus Node.js/npm (the frontend was verified with Node.js 24.21.0). The listed [scikit-learn 1.5.2](https://pypi.org/project/scikit-learn/1.5.2/) and [NumPy 1.26.4](https://pypi.org/project/numpy/1.26.4/) releases provide Windows Python 3.11 wheels. The only Python installed in the review environment was 3.14, for which the pinned scikit-learn wheel was unavailable. From the repository root:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python run.py
```

The API binds to `127.0.0.1:8000`; health and OpenAPI are at `/api/health` and `/docs`. In another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
npm run dev
```

Open `http://localhost:5173`. The frontend defaults to `http://localhost:8000/api`; `VITE_API_BASE_URL` can override this.

### Enabling predictions

The supplied folder has neither `triage_model.joblib` nor `5v_cleandf.rdata`. If you have the rights to use the dataset, place the expected `.rdata` file at `backend/ml/data/5v_cleandf.rdata`, inspect its provenance and schema, and run `python -m ml.train_real` from `backend/`. This generates the local model artifact. Keep patient level data and generated artifacts out of Git. `ml/download_data.py` currently downloads a different CSV dataset and **does not** supply the `.rdata` file expected by `train_real.py`; `ml/generate_data.py` creates synthetic CSV data but is not connected to the current training command.

### Demonstration mode assessment

A separate, explicitly labeled DEMO path could use generated synthetic cases and predetermined responses to show the interface without a model. It should not return clinical recommendations or imply that its numbers are measured model probabilities. The existing `ml/generate_data.py` only writes synthetic CSV rows; it does not create a model usable by the current API. No simulated inference endpoint or synthetic model has been added to this repository. The current interface preview is therefore a UI demo, while prediction remains unavailable.

## Checks and limitations

```powershell
cd backend
python -m compileall -q app ml
cd ../frontend
npm run build
npm run lint
```

There is no automated test suite in the supplied project. On 26 October 2026, Python syntax compilation, a clean `npm ci`, React production build and ESLint passed. `npm audit` reported **0 known frontend vulnerabilities** after dependency lockfile updates. The API started using already installed host packages (different versions from the pinned requirements): health and `/docs` returned 200, a valid synthetic triage request returned 503 because the model is missing, and an invalid request returned 422. A dry run of the pinned installation on Python 3.14 failed at `scikit-learn==1.5.2`; a clean Python 3.11 installation remains to be verified. A real data evaluation, calibration, subgroup assessment, prospective validation, medical oversight, privacy review and regulatory assessment have not been performed here. The displayed probability is the model's score, not a clinically validated confidence estimate. Clinical labels and time recommendations are prototype text.

The code allows a free text complaint via the API. The browser offers a fixed complaint list. Report printing is local to the browser; avoid entering real patient identifiers in this prototype. The API returns generic error messages rather than exposing internal paths or exception details.

## Repository hygiene

Environment files, trained models, datasets, generated builds and the original project PDFs are excluded. The [UI demo screenshot](docs/screenshots/demo-interface.png) shows empty/default fields and the warning banner; it does not show a prediction. The earlier README claimed specific training size and accuracy, but no supporting model or evaluation output was present, so those figures are deliberately omitted.
