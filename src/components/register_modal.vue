<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')" aria-label="Закрыть">
        <span></span>
        <span></span>
      </button>

      <div class="modal-header">
        <h2 class="modal-title">Создать аккаунт</h2>
        <p class="modal-subtitle">Присоединяйтесь к Нетеста</p>
      </div>

      <form @submit.prevent="handleRegister" class="modal-form">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
              type="text"
              id="name"
              v-model="form.name"
              placeholder="Иван Петров"
              required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
              type="email"
              id="email"
              v-model="form.email"
              placeholder="your@email.com"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              placeholder="Минимум 8 символов"
              required
          />
          <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Скрыть' : 'Показать' }}
          </button>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="form.confirmPassword"
              placeholder="Повторите пароль"
              required
          />
          <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
          >
            {{ showConfirmPassword ? 'Скрыть' : 'Показать' }}
          </button>
        </div>

        <div class="form-group role-group">
          <label>Роль</label>
          <div class="role-options">
            <label class="radio">
              <input type="radio" value="student" v-model="form.role" />
              <span>Студент</span>
            </label>
            <label class="radio">
              <input type="radio" value="teacher" v-model="form.role" />
              <span>Преподаватель</span>
            </label>
          </div>
        </div>

        <label class="checkbox terms">
          <input type="checkbox" v-model="form.agree" required />
          <span>
            Я соглашаюсь с
            <a href="#">условиями использования</a>
            и
            <a href="#">политикой конфиденциальности</a>
          </span>
        </label>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else>Загрузка...</span>
        </button>
      </form>

      <div class="modal-footer">
        <p>
          Уже есть аккаунт?
          <button class="link-button" @click="$emit('switch-to-login')">
            Войти
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterModal',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        agree: false,
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
    }
  },
  methods: {
    handleRegister() {
      if (this.form.password !== this.form.confirmPassword) {
        alert('Пароли не совпадают')
        return
      }

      this.loading = true
      // Имитация запроса к API
      setTimeout(() => {
        this.loading = false
        console.log('Register:', this.form)
        // Здесь будет реальная логика регистрации
        this.$emit('close')
      }, 1000)
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  width: 100%;
  max-width: 440px;
  position: relative;
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.modal-close span {
  position: absolute;
  width: 18px;
  height: 1px;
  background: #999;
  left: 3px;
  transition: background 0.2s;
}

.modal-close span:first-child {
  transform: rotate(45deg);
}

.modal-close span:last-child {
  transform: rotate(-45deg);
}

.modal-close:hover span {
  background: #111;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 450;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  line-height: 1.2;
}

.modal-subtitle {
  color: #666;
  font-size: 0.95rem;
}

.modal-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: white;
  border-radius: 0;
}

.form-group input:focus {
  outline: none;
  border-color: #111;
}

.password-toggle {
  position: absolute;
  right: 12px;
  bottom: 11px;
  background: none;
  border: none;
  color: #999;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}

.password-toggle:hover {
  color: #111;
}

.role-group {
  margin-bottom: 16px;
}

.role-options {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
}

.radio input {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.checkbox input {
  width: 16px;
  height: 16px;
  margin-top: 3px;
  flex-shrink: 0;
}

.checkbox a {
  color: #111;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.checkbox a:hover {
  color: #333;
}

.terms {
  line-height: 1.5;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  background: none;
  text-align: center;
}

.btn-primary {
  background: #111;
  color: white;
  border-color: #111;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.modal-footer {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.link-button {
  background: none;
  border: none;
  color: #111;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
}

.link-button:hover {
  color: #333;
}

/* Стили для скролла */
.modal::-webkit-scrollbar {
  width: 4px;
}

.modal::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal::-webkit-scrollbar-thumb {
  background: #ddd;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>