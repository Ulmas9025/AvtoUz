document.addEventListener('DOMContentLoaded', function() {
	// Правильные учетные данные
	const CORRECT_LOGIN = "ulmas9025";
	const CORRECT_PASSWORD_HASH = "55156366c82919bd73963f3955ad8c56482fc0a780cf49fd854f89273d518c20"; // Новый правильный хеш

	const loginForm = document.getElementById('loginForm');
	const errorMsg = document.getElementById('errorMsg');

	// Проверка авторизации при загрузке
	if (localStorage.getItem('authenticated')) {
			window.location.href = 'index.html';
	}

	// Обработчик формы
	loginForm.addEventListener('submit', function(e) {
			e.preventDefault();
			
			const login = document.getElementById('login').value.trim();
			const password = document.getElementById('password').value.trim();
			
			errorMsg.style.display = 'none';
			
			if (!login || !password) {
					showError("Заполните все поля");
					return;
			}
			
			try {
					const hashedPassword = CryptoJS.SHA256(password).toString();
					console.log("Сгенерированный хеш:", hashedPassword);
					
					if (login === CORRECT_LOGIN && hashedPassword === CORRECT_PASSWORD_HASH) {
							localStorage.setItem('authenticated', 'true');
							window.location.href = 'index.html';
					} else {
							showError("Неверный логин или пароль!");
					}
			} catch (error) {
					console.error("Ошибка:", error);
					showError("Ошибка системы");
			}
	});

	function showError(message) {
			errorMsg.textContent = message;
			errorMsg.style.display = 'block';
	}
});