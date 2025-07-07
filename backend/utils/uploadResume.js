import fs from 'fs';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: new URL('./service-account.json', import.meta.url).pathname,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const uploadToDrive = async (filePath, fileName, folderId, mimeType = 'application/pdf') => {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });

  // Make file public
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: file.data.id,
    viewLink: file.data.webViewLink,
    downloadLink: file.data.webContentLink,
  };
};

export default uploadToDrive; 