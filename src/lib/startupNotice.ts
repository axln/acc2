// Shown in place of the app when it can't open its database at startup, so the user gets
// instructions instead of a blank page. Plain DOM with its own styles, since neither the app
// nor its stylesheet has loaded at that point. The colors match the app's theme in app.css.

const ID = 'startup-notice';

const STYLE = `
	#${ID} {
		--canvas: 243 244 248; --fg: 17 24 39; --muted: 100 110 128; --primary: 124 58 237;
		position: fixed; inset: 0; z-index: 50; overflow-y: auto; padding: 40px 24px;
		background: rgb(var(--canvas)); color: rgb(var(--fg));
		font: 17px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}
	@media (prefers-color-scheme: dark) {
		#${ID} { --canvas: 12 14 20; --fg: 236 238 243; --muted: 150 158 175; --primary: 157 120 250; }
	}
	#${ID} > div { max-width: 28rem; margin: 0 auto; }
	#${ID} h1 { margin: 0 0 16px; font-size: 22px; font-weight: 600; line-height: 1.3; }
	#${ID} p, #${ID} ul { margin: 0 0 16px; }
	#${ID} ul { padding-left: 20px; }
	#${ID} li + li { margin-top: 8px; }
	#${ID} .muted { color: rgb(var(--muted)); font-size: 15px; }
	#${ID} button {
		width: 100%; height: 48px; border: 0; border-radius: 12px; font: inherit; font-weight: 500;
		background: rgb(var(--primary)); color: #fff; cursor: pointer;
	}
`;

export function showStartupNotice(error?: unknown) {
	document.getElementById(ID)?.remove();

	const notice = document.createElement('div');
	notice.id = ID;
	notice.innerHTML = `
		<style>${STYLE}</style>
		<div>
			<h1></h1>
			<p class="muted" data-role="error" hidden></p>
			<p>This usually happens after an update, while an older copy of Acc still has your data open.</p>
			<ul>
				<li>Close Acc in every other tab and window, including the installed app, then reload.</li>
				<li>On a phone, swipe Acc and Chrome away from the recent apps. If that doesn't help, stop Chrome in Settings → Apps → Chrome → Force stop.</li>
				<li>On a computer, quit the browser completely and open Acc again.</li>
			</ul>
			<p class="muted">Your data is kept in this browser only. Don't clear the site data or the app's storage: that deletes it.</p>
			<button type="button">Reload</button>
		</div>`;

	notice.querySelector('h1')!.textContent = error
		? "Acc couldn't open your data"
		: 'Acc is waiting to open your data';

	if (error) {
		const errorText = notice.querySelector<HTMLElement>('[data-role=error]')!;
		errorText.textContent =
			error instanceof Error ? `${error.name}: ${error.message}` : String(error);
		errorText.hidden = false;
	}

	notice.querySelector('button')!.addEventListener('click', () => location.reload());
	document.body.append(notice);
}

export function hideStartupNotice() {
	document.getElementById(ID)?.remove();
}
