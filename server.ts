import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * LA BÀN TƯƠNG LAI (THPT 15–18 TUỔI) — OFFLINE-FIRST STATIC & VITE HOST
 * Tuân thủ mục B của tài liệu 03_Chi_dan_lap_trinh_va_kiem_thu.md:
 * - 100% Rule-based cục bộ (Phiếu 2.0, Quy tắc 2.0.1).
 * - Không gọi Gemini API, LLM, chatbot AI, proxy AI hay dịch vụ telemetry lúc chạy.
 * - Không gửi hay lưu trữ dữ liệu cá nhân của học sinh trên máy chủ.
 */
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Endpoint kiểm tra trạng thái ngoại tuyến / phiên bản quy chuẩn 2.0.1
  app.get('/api/health', (_req, res) => {
    res.json({
      app: 'La Bàn Tương Lai',
      questionVersion: '2.0',
      ruleVersion: '2.0.1',
      mode: 'offline_rule_based_no_runtime_ai',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`La Bàn Tương Lai (2.0.1 Offline Rule-Based) running at http://localhost:${PORT}`);
  });
}

startServer();
