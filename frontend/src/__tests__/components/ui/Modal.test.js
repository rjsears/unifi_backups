// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UniFi Backup Manager - Modal Component Tests
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '@/components/ui/Modal.vue'

describe('Modal Component', () => {
  // Clean up any teleported content after each test
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  function createWrapper(props = {}, slots = {}) {
    return mount(Modal, {
      props: {
        modelValue: true,
        ...props,
      },
      slots: {
        default: 'Modal content',
        ...slots,
      },
      attachTo: document.body,
    })
  }

  describe('visibility', () => {
    it('should render when modelValue is true', () => {
      createWrapper({ modelValue: true })
      expect(document.body.textContent).toContain('Modal content')
    })

    it('should not render when modelValue is false', () => {
      createWrapper({ modelValue: false })
      expect(document.body.textContent).not.toContain('Modal content')
    })
  })

  describe('title', () => {
    it('should render title when provided', () => {
      createWrapper({ title: 'Test Modal Title' })
      expect(document.body.textContent).toContain('Test Modal Title')
    })

    it('should not render header section without title or header slot', () => {
      createWrapper({ title: '' })
      const header = document.querySelector('.border-b')
      expect(header).toBeNull()
    })
  })

  describe('slots', () => {
    it('should render default slot content', () => {
      createWrapper({}, { default: 'Custom modal content' })
      expect(document.body.textContent).toContain('Custom modal content')
    })

    it('should render header slot when provided', () => {
      createWrapper({}, { header: 'Custom Header' })
      expect(document.body.textContent).toContain('Custom Header')
    })

    it('should render footer slot when provided', () => {
      createWrapper({}, { footer: 'Custom Footer' })
      expect(document.body.textContent).toContain('Custom Footer')
    })

    it('should not render footer section without footer slot', () => {
      createWrapper()
      // Footer has specific classes
      const footer = document.querySelector('.rounded-b-lg')
      expect(footer).toBeNull()
    })
  })

  describe('closing behavior', () => {
    it('should emit close when close button is clicked', async () => {
      const wrapper = createWrapper({ title: 'Test', closable: true })

      const closeButton = document.querySelector('button')
      await closeButton.click()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should emit close when backdrop is clicked', async () => {
      const wrapper = createWrapper()

      const backdrop = document.querySelector('.bg-black\\/60')
      await backdrop.click()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close when closable is false and close button clicked', () => {
      const wrapper = createWrapper({ title: 'Test', closable: false })

      // Close button should not exist when closable is false
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBe(0)
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should not emit close when closable is false and backdrop clicked', async () => {
      const wrapper = createWrapper({ closable: false })

      const backdrop = document.querySelector('.bg-black\\/60')
      await backdrop.click()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('size variations', () => {
    it('should apply sm size class', () => {
      createWrapper({ size: 'sm' })
      expect(document.querySelector('.max-w-sm')).toBeTruthy()
    })

    it('should apply md size class by default', () => {
      createWrapper()
      expect(document.querySelector('.max-w-md')).toBeTruthy()
    })

    it('should apply lg size class', () => {
      createWrapper({ size: 'lg' })
      expect(document.querySelector('.max-w-lg')).toBeTruthy()
    })

    it('should apply xl size class', () => {
      createWrapper({ size: 'xl' })
      expect(document.querySelector('.max-w-xl')).toBeTruthy()
    })

    it('should apply full size class', () => {
      createWrapper({ size: 'full' })
      expect(document.querySelector('.max-w-4xl')).toBeTruthy()
    })
  })

  describe('body scroll lock', () => {
    it('should lock body scroll when modal opens', async () => {
      const wrapper = createWrapper({ modelValue: false })

      await wrapper.setProps({ modelValue: true })

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should unlock body scroll when modal closes', async () => {
      const wrapper = createWrapper({ modelValue: true })

      // Wait for the watch to trigger
      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ modelValue: false })

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('props validation', () => {
    it('should accept valid size values', () => {
      const validSizes = ['sm', 'md', 'lg', 'xl', 'full']
      validSizes.forEach((size) => {
        const wrapper = createWrapper({ size })
        expect(wrapper.vm.size).toBe(size)
      })
    })

    it('should default closable to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.closable).toBe(true)
    })

    it('should default modelValue to false', () => {
      const wrapper = mount(Modal, { attachTo: document.body })
      expect(wrapper.vm.modelValue).toBe(false)
    })
  })
})
