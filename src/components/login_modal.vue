<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')" aria-label="Закрыть">
        <span></span>
        <span></span>
      </button>

      <div class="modal-header">
        <h2 class="modal-title">Вход в Нетеста</h2>
        <p class="modal-subtitle">Войдите в свой аккаунт</p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="modal-form">
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
              placeholder="••••••••"
              :disabled="loading"
              required
          />
          <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              :disabled="loading"
          >
            <span v-if="showPassword">Скрыть</span>
            <span v-else>Показать</span>
          </button>
        </div>

        <div class="form-options">
          <label class="checkbox">
            <input type="checkbox" v-model="form.remember" :disabled="loading" />
            <span>Запомнить меня</span>
          </label>
          <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">Забыли пароль?</a>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="!loading">Войти</span>
          <span v-else>
            <span class="spinner"></span>
            Загрузка...
          </span>
        </button>
      </form>

      <div class="modal-footer">
        <p>
          Нет аккаунта?
          <button class="link-button" @click="$emit('switch-to-register')" :disabled="loading">
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'LoginModal',
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false,
      },
      showPassword: false,
      loading: false,
      error: null,
    }
  },
  methods: {
    async handleLogin() {
      // Валидация
      if (!this.form.email || !this.form.password) {
        this.error = 'Пожалуйста, заполните все поля'
        return
      }

      this.loading = true
      this.error = null

      try {
        // Пытаемся войти через email (студент или преподаватель)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.form.email,
          password: this.form.password,
        })

        if (error) throw error

        if (data?.user) {
          console.log('Успешный вход:', data.user)

          // Если пользователь выбрал "Запомнить меня", устанавливаем более длительную сессию
          if (this.form.remember) {
            // В Supabase это настраивается на уровне проекта
            // Можно дополнительно сохранить флаг в localStorage
            localStorage.setItem('remember_me', 'true')
          }

          // Получаем профиль пользователя для определения роли
          const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()

          if (profileError) {
            console.warn('Не удалось загрузить профиль:', profileError)
          }

          // Определяем роль пользователя
          const userRole = profile?.role || 'student'

          // Сохраняем информацию о пользователе
          localStorage.setItem('user_role', userRole)

          // Показываем успешное сообщение
          this.$emit('login-success', { user: data.user, role: userRole })

          // Закрываем модальное окно
          this.$emit('close')

          // Перенаправляем в зависимости от роли
          if (userRole === 'teacher' || userRole === 'admin') {
            this.$router.push('/teacher/tests')
          } else {
            this.$router.push('/tests')
          }
        }
      } catch (error) {
        console.error('Ошибка входа:', error)

        // Обработка различных ошибок
        if (error.message.includes('Invalid login credentials')) {
          this.error = 'Неверный email или пароль'
        } else if (error.message.includes('Email not confirmed')) {
          this.error = 'Email не подтвержден. Проверьте вашу почту'
        } else if (error.message.includes('rate limit')) {
          this.error = 'Слишком много попыток. Попробуйте позже'
        } else {
          this.error = error.message || 'Ошибка при входе. Попробуйте позже'
        }
      } finally {
        this.loading = false
      }
    },

    handleForgotPassword() {
      // Открываем модальное окно восстановления пароля
      this.$emit('switch-to-forgot-password')
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
  max-width: 400px;
  position: relative;
  padding: 40px;
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

/* Сообщение об ошибке */
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #ffcdd2;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
}

.checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
}

.checkbox input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.forgot-link {
  color: #666;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.forgot-link:hover {
  color: #111;
  border-bottom-color: #111;
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

/* Спиннер загрузки */
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