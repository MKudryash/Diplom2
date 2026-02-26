<template>
  <div class="home">
    <app-navigation></app-navigation>

    <!-- Hero Section - Максимально просто -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">Нетеста.</h1>
        <p class="hero-subtitle">
          Платформа для создания тестов, управления группами <br>и анализа результатов. Без лишнего.
        </p>
        <div class="hero-actions">
          <a href="/login" class="btn btn-primary">Войти</a>
          <a href="/register" class="btn btn-outline">Зарегистрироваться</a>
        </div>
        <div class="hero-badges">
          <span>Быстро</span>
          <span>Надежно</span>
          <span>Доступно</span>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <p class="stat-number">50k+</p>
            <p class="stat-label">Проведено тестов</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">12.5k+</p>
            <p class="stat-label">Активных пользователей</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">850+</p>
            <p class="stat-label">Учебных групп</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">98%</p>
            <p class="stat-label">Точность</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">24/7</p>
            <p class="stat-label">Доступность</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">100+</p>
            <p class="stat-label">Шаблонов</p>
          </div>
        </div>
      </div>
    </section>





    <!-- Testimonials Section -->
    <section class="testimonials">
      <div class="container">
        <div class="testimonials-grid">
          <div class="testimonial">
            <p class="testimonial-text">"Изменила подход к аттестации. Экономит время."</p>
            <div class="testimonial-author">
              <span class="author-name">Анна К.</span>
              <span class="author-role">Преподаватель</span>
            </div>
          </div>
          <div class="testimonial">
            <p class="testimonial-text">"Удобно, быстро, прозрачно. Знаю свой прогресс."</p>
            <div class="testimonial-author">
              <span class="author-name">Иван С.</span>
              <span class="author-role">Студент</span>
            </div>
          </div>
          <div class="testimonial">
            <p class="testimonial-text">"Лучшее решение для корпоративного обучения."</p>
            <div class="testimonial-author">
              <span class="author-name">Марина Д.</span>
              <span class="author-role">HR-директор</span>
            </div>
          </div>
        </div>
      </div>
    </section>




    <app-footer></app-footer>
  </div>
</template>

<script>
import AppNavigation from '../components/navigation'
import AppFooter from '../components/footer'

export default {
  name: 'Home',
  components: {
    AppNavigation,
    AppFooter,
  },
}
</script>

<style scoped>
/* Базовые стили и переменные */
.home {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #111;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 2rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
  line-height: 1.2;
}

/* Hero */
.hero {
  padding: 120px 0 80px;
  background: linear-gradient(to bottom, #fafafa, #fff);
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: 450;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.hero-badges {
  display: flex;
  gap: 2rem;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}

/* Stats */
.stats {
  padding: 80px 0;
  border-bottom: 1px solid #eee;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Process */
.process {
  padding: 80px 0;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.step-number {
  font-size: 3rem;
  font-weight: 400;
  color: #ddd;
  display: block;
  margin-bottom: 1rem;
  line-height: 1;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.step-text {
  color: #666;
}

/* Features */
.features {
  padding: 80px 0;
  background: #fafafa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.feature h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #666;
  font-size: 0.95rem;
}

/* Testimonials */
.testimonials {
  padding: 80px 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.testimonial-text {
  font-size: 1rem;
  font-style: italic;
  color: #333;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
}

.author-role {
  font-size: 0.85rem;
  color: #999;
}

/* About */
.about {
  padding: 80px 0;
  border-top: 1px solid #eee;
}

.about-content p {
  color: #666;
  margin-bottom: 1.5rem;
  max-width: 600px;
}

/* CTA */
.cta {
  padding: 100px 0;
  background: #111;
  color: white;
  text-align: center;
}

.cta .section-title {
  color: white;
}

.cta p {
  color: #aaa;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.cta-small {
  font-size: 0.85rem;
  color: #666;
}

/* Кнопки */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: #111;
  color: white;
  border-color: #111;
}

.btn-primary:hover {
  background: #333;
  border-color: #333;
}

.btn-outline {
  background: transparent;
  color: #111;
  border-color: #ddd;
}

.btn-outline:hover {
  border-color: #111;
}

.btn-link {
  padding-left: 0;
  padding-right: 0;
  color: #111;
  text-decoration: underline;
  text-underline-offset: 4px;
  border: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .hero-title { font-size: 3rem; }
  .process-steps { grid-template-columns: 1fr; gap: 2rem; }
  .features-grid { grid-template-columns: 1fr; gap: 2rem; }
  .testimonials-grid { grid-template-columns: 1fr; gap: 2rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>