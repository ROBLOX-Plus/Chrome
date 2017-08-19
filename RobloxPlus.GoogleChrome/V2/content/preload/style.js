﻿var RPlus = RPlus || {};
RPlus.style = RPlus.style || (function () {
	var themeStorageName = "rplusTheme";
	var overrideTheme = null;
	var html = document.documentElement;
	var themes = [
		{
			type: "obc",
			name: "OBC",
			className: "obc-theme",
			file: "/css/themes/obc.css",
			isUnlocked: function () {
				return new Promise(function (resolve, reject) {
					resolve(true);
				});
			}
		}, {
			type: "easter",
			name: "Easter",
			className: "easter-theme",
			file: "/css/themes/easter.css",
			isUnlocked: function () {
				return new Promise(function (resolve, reject) {
					RPlus.premium.allThemesUnlocked(Roblox.users.authenticatedUserId).then(function (e) {
						resolve(e);
					}).catch(reject);
				});
			}
		}];
	var themeTypes = {};


	themes.forEach(function (theme) {
		theme.file = chrome.extension.getURL(theme.file);
		themeTypes[theme.type] = theme;
	});

	function setTheme(newTheme, save) {
		var storageTheme = "";
		themes.forEach(function (theme) {
			if (newTheme && newTheme.type === theme.type) {
				html.classList.add(theme.className);
				storageTheme = theme.type;
			} else {
				html.classList.remove(theme.className);
			}
		});
		if (save) {
			if (storageTheme) {
				localStorage.setItem(themeStorageName, storageTheme);
			} else {
				localStorage.removeItem(themeStorageName);
			}
			if (window.storage) {
				storage.set("siteTheme", storageTheme);
			}
		}
	}

	function loadStylesheet(stylesheetLocation) {
		fetch(stylesheetLocation).then(function (response) {
			response.text().then(function (originalCss) {
				var css = originalCss.replace(/url\(([^)]+)\)/gi, function (u) {
					var url = u.substring(4, u.length - 1);
					if (url.match(/^\w+:/)) {
						return u;
					} else {
						return "url(" + chrome.extension.getURL(url) + ")";
					}
				});
				var styleTag = document.createElement("style");
				styleTag.innerHTML = css;
				document.head.appendChild(styleTag);
			}).catch(function (e) {
				console.warn("Failed to read stylesheet\n\t", stylesheetLocation, "\n\t", e);
			});
		}).catch(function (e) {
			console.warn("Failed to load stylesheet\n\t", stylesheetLocation, "\n\t", e);
		});
	}

	function loadThemeFromStorage() {
		var theme = localStorage.getItem(themeStorageName);
		if (theme) {
			if (theme === "obc-theme") {
				theme = "obc";
			} else if (theme === "easter-theme") {
				theme = "easter";
			} else {
				localStorage.removeItem(themeStorageName);
			}
		}
		setTheme(RPlus.style.themeTypes[theme], true);
	}

	function init(themeOverride) {
		themes.forEach(function (theme) {
			loadStylesheet(theme.file);
		});
		if (themeOverride) {
			overrideTheme = themeOverride;
			setTheme(themeOverride, false);
		} else {
			loadThemeFromStorage();
		}
	}

	return {
		themeTypes: themeTypes,
		getActivatedThemes: function () {
			var selected = [];
			themes.forEach(function (theme) {
				if (html.classList.contains(theme.className)) {
					selected.push(theme);
				}
			});
			return selected;
		},
		setTheme: function (theme) {
			if (!overrideTheme) {
				setTheme(theme, true);
			}
		},
		overrideTheme: function (theme) {
			overrideTheme = theme;
			setTheme(theme, false);
		},
		loadThemeFromStorage: function() {
			if (!overrideTheme) {
				loadThemeFromStorage();
			}
		},
		loadStylesheet: loadStylesheet,
		init: init
	};
})();

// WebGL3D
