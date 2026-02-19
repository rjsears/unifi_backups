// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - LoginView Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginView from '@/views/LoginView.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock auth store
const mockLogin = vi.fn()
const mockAuthStore = {
  login: mockLogin,
  error: null,
}
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock theme store
vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    themeClasses: '',
  }),
}))

// Mock notifications store
const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/stores/notifications', () => ({
  useNotificationsStore: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

describe('LoginView', () => {
  function createWrapper() {
    return mount(LoginView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          UserIcon: true,
          EyeIcon: true,
          EyeSlashIcon: true,
          LockClosedIcon: true,
        },
      },
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
    mockLogin.mockClear()
    mockSuccess.mockClear()
    mockError.mockClear()
    mockAuthStore.error = null
  })

  describe('rendering', () => {
    it('should render the login form', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('should render username input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#username').exists()).toBe(true)
    })

    it('should render password input', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('#password').exists()).toBe(true)
    })

    it('should render submit button', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should display UniFi Backup title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('UniFi Backup')
    })

    it('should display Backup Manager subtitle', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Backup Manager')
    })

    it('should display version number', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('v1.0.0')
    })
  })

  describe('form validation', () => {
    it('should disable submit button when username is empty', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#password').setValue('password123')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should disable submit button when password is empty', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should enable submit button when both fields are filled', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('password visibility toggle', () => {
    it('should render password input as type password by default', () => {
      const wrapper = createWrapper()
      const passwordInput = wrapper.find('#password')
      expect(passwordInput.attributes('type')).toBe('password')
    })

    it('should toggle password visibility when toggle button clicked', async () => {
      const wrapper = createWrapper()

      await wrapper.find('button[type="button"]').trigger('click')

      expect(wrapper.find('#password').attributes('type')).toBe('text')
    })

    it('should toggle back to password type on second click', async () => {
      const wrapper = createWrapper()

      const toggleButton = wrapper.find('button[type="button"]')

      await toggleButton.trigger('click')
      expect(wrapper.find('#password').attributes('type')).toBe('text')

      await toggleButton.trigger('click')
      expect(wrapper.find('#password').attributes('type')).toBe('password')
    })
  })

  describe('form submission', () => {
    it('should call login with credentials on submit', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit')

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      })
    })

    it('should redirect to home on successful login', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should show success notification on successful login', async () => {
      mockLogin.mockResolvedValue(true)
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(mockSuccess).toHaveBeenCalledWith('Welcome back!')
    })

    it('should show error notification on failed login', async () => {
      mockLogin.mockResolvedValue(false)
      mockAuthStore.error = 'Invalid credentials'
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('wrongpassword')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(mockError).toHaveBeenCalledWith('Login Failed', 'Invalid credentials')
    })

    it('should not submit when form is invalid', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('')
      await wrapper.find('#password').setValue('')
      await wrapper.find('form').trigger('submit')

      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should show loading spinner during login', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('Signing in...')
    })

    it('should disable submit button during login', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('error display', () => {
    it('should display error message when login fails', async () => {
      mockLogin.mockResolvedValue(false)
      mockAuthStore.error = 'Invalid credentials'
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('wrongpassword')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.text()).toContain('Invalid credentials')
    })

    it('should hide error alert when no error', () => {
      const wrapper = createWrapper()
      const errorAlert = wrapper.find('.bg-red-100')
      expect(errorAlert.exists()).toBe(false)
    })
  })

  describe('input binding', () => {
    it('should update username model on input', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#username').setValue('newuser')

      expect(wrapper.find('#username').element.value).toBe('newuser')
    })

    it('should update password model on input', async () => {
      const wrapper = createWrapper()

      await wrapper.find('#password').setValue('newpass')

      expect(wrapper.find('#password').element.value).toBe('newpass')
    })
  })
})
