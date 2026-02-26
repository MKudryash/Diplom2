<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <!-- Brand -->
        <div class="footer-brand">
          <span class="footer-logo">Нетеста</span>
          <p class="footer-description">
            Современная платформа для тестирования и оценки знаний.
          </p>
        </div>

        <!-- Navigation -->
        <div class="footer-links">
          <div class="footer-column">
            <h4>Навигация</h4>
            <a href="/">Главная</a>
            <a href="#about">О платформе</a>
            <a href="#stats">Статистика</a>
          </div>
          <div class="footer-column">
            <h4>Аккаунт</h4>
            <a href="/login">Вход</a>
            <a href="/register">Регистрация</a>
            <a href="#">Помощь</a>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="footer-bottom">
        <p class="copyright">© 2026 Нетеста. Все права защищены.</p>
        <div class="footer-legal">
          <a href="#">Политика</a>
          <a href="#">Условия</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  padding: 60px 0 30px;
  background: #fafafa;
  border-top: 1px solid #eee;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-top {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-logo {
  font-size: 1.25rem;
  font-weight: 500;
  display: block;
  margin-bottom: 1rem;
}

.footer-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 300px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.footer-column h4 {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
}

.footer-column a {
  display: block;
  text-decoration: none;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  transition: color 0.2s;
}

.footer-column a:hover {
  color: #111;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
  color: #999;
}

.footer-legal {
  display: flex;
  gap: 2rem;
}

.footer-legal a {
  text-decoration: none;
  color: #999;
}

.footer-legal a:hover {
  color: #666;
}

/* Адаптивность */
@media (max-width: 768px) {
  .footer-top {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-legal {
    justify-content: center;
  }
}
</style>