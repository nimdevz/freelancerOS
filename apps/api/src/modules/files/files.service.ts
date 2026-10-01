import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private storageDir = path.resolve(process.cwd(), 'data', 'uploads');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async getUploadUrl(params: { fileName: string; mimeType: string; size: number }) {
    // Cloudflare R2 / S3 signed URL generator architecture
    const fileId = `${Date.now()}-${params.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const publicUrl = `/api/files/download/${fileId}`;

    return {
      uploadUrl: `/api/files/upload/${fileId}`,
      publicUrl,
      fileKey: fileId,
    };
  }

  saveFile(fileKey: string, buffer: Buffer) {
    const filePath = path.join(this.storageDir, fileKey);
    fs.writeFileSync(filePath, buffer);
    return `/api/files/download/${fileKey}`;
  }

  getFilePath(fileKey: string): string | null {
    const filePath = path.join(this.storageDir, fileKey);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}
