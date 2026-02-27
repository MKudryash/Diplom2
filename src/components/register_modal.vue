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

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Сообщение об успехе -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <form @submit.prevent="handleRegister" class="modal-form">
        <div class="form-group">
          <label for="first_name">Имя</label>
          <input
              type="text"
              id="first_name"
              v-model="form.first_name"
              placeholder="Иван"
              :disabled="loading"
              required
          />
        </div>

        <div class="form-group">
          <label for="last_name">Фамилия</label>
          <input
              type="text"
              id="last_name"
              v-model="form.last_name"
              placeholder="Петров"
              :disabled="loading"
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
              :disabled="loading"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              placeholder="Минимум 6 символов"
              :disabled="loading"
              required
          />
          <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="loading"
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
              :disabled="loading"
              required
          />
          <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :disabled="loading"
          >
            {{ showConfirmPassword ? 'Скрыть' : 'Показать' }}
          </button>
        </div>

        <div class="form-group role-group">
          <label>Роль</label>
          <div class="role-options">
            <label class="radio">
              <input type="radio" value="student" v-model="form.role" :disabled="loading" />
              <span>Студент</span>
            </label>
            <label class="radio">
              <input type="radio" value="teacher" v-model="form.role" :disabled="loading" />
              <span>Преподаватель</span>
            </label>
          </div>
        </div>

        <label class="checkbox terms">
          <input type="checkbox" v-model="form.agree" :disabled="loading" required />
          <span>
            Я соглашаюсь с
            <a href="#" @click.prevent>условиями использования</a>
            и
            <a href="#" @click.prevent>политикой конфиденциальности</a>
          </span>
        </label>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="!loading">Зарегистрироваться</span>
          <span v-else>
            <span class="spinner"></span>
            Загрузка...
          </span>
        </button>
      </form>

      <div class="modal-footer">
        <p>
          Уже есть аккаунт?
          <button class="link-button" @click="$emit('switch-to-login')" :disabled="loading">
            Войти
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'RegisterModal',
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        agree: false,
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      error: null,
      success: null,
    }
  },
  methods: {
    async handleRegister() {
      // Валидация
      if (!this.form.first_name || !this.form.last_name || !this.form.email || !this.form.password) {
        this.error = 'Пожалуйста, заполните все поля'
        return
      }

      if (this.form.password.length < 6) {
        this.error = 'Пароль должен быть не менее 6 символов'
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Пароли не совпадают'
        return
      }

      if (!this.form.agree) {
        this.error = 'Необходимо согласиться с условиями использования'
        return
      }

      this.loading = true
      this.error = null
      this.success = null

      try {
        // Регистрируем пользователя в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: this.form.email,
          password: this.form.password,
          options: {
            data: {
              first_name: this.form.first_name,
              last_name: this.form.last_name,
              role: this.form.role,
            },
            emailRedirectTo: `${window.location.origin}/login`,
          }
        })

        if (authError) throw authError

        if (authData?.user) {
          // Создаем профиль пользователя
          const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: authData.user.id,
                email: this.form.email,
                first_name: this.form.first_name,
                last_name: this.form.last_name,
                role: this.form.role,
              }])

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }

          // Настройки пользователя по умолчанию
          const { error: settingsError } = await supabase
              .from('user_settings')
              .insert([{
                user_id: authData.user.id,
              }])

          if (settingsError) {
            console.error('Error creating user settings:', settingsError)
          }

          this.success = 'Регистрация успешна! Проверьте вашу почту для подтверждения email.'

          // Автоматически закрываем модальное окно через 3 секунды
          setTimeout(() => {
            this.$emit('close')
          }, 3000)
        }
      } catch (error) {
        console.error('Ошибка регистрации:', error)

        if (error.message.includes('User already registered')) {
          this.error = 'Пользователь с таким email уже зарегистрирован'
        } else if (error.message.includes('weak password')) {
          this.error = 'Слишком слабый пароль'
        } else {
          this.error = error.message || 'Ошибка при регистрации. Попробуйте позже'
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Стили аналогичны LoginModal с добавлением новых классов */

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #ffcdd2;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #a5d6a7;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.radio input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.terms {
  margin-bottom: 24px;
  line-height: 1.5;
}

.terms a {
  color: #111;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.terms a:hover {
  color: #333;
}

/* Остальные стили из LoginModal */
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

.form-group input {
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

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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

.password-toggle:hover:not(:disabled) {
  color: #111;
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.link-button:hover:not(:disabled) {
  color: #333;
}

.link-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>