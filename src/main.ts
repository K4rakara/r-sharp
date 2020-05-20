import path from 'path';
import { app, BrowserWindow } from 'electron';

let window: BrowserWindow|null = null;

const createWindow = (): void =>
{
	window = new BrowserWindow
	({
		width: 800,
		height: 600,
		webPreferences:
		{
			nodeIntegration: true,
		},
	});

	window.loadFile(path.join(__dirname, 'index.html'));
};

app.whenReady().then((): void =>
{
	createWindow();
	app.on('activate', (): void =>
	{
		if (BrowserWindow.getAllWindows().length === 0)
			createWindow();
	});
});

app.on('window-all-closed', (): void =>
{
	if (process.platform !== 'darwin') app.quit();
});
