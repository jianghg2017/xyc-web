/**
 * Property-Based Tests for Contact page form validation
 *
 * Property 8: Contact form rejects submissions missing required fields
 * Validates: Requirements 6.3
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateContactForm } from './index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty trimmed string (simulates a filled field) */
const nonEmptyString = fc.string({ minLength: 1 }).map((s) => s.trim()).filter((s) => s.length > 0)

/** Arbitrary for an empty or whitespace-only string (simulates a missing field) */
const emptyString = fc.oneof(
  fc.constant(''),
  fc.string({ minLength: 1, maxLength: 5 }).map((s) => ' '.repeat(s.length))
)

/** Arbitrary for a valid email address */
const validEmail = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
    fc.constantFrom('com', 'net', 'org', 'cn')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

/** Arbitrary for an invalid email (no @ or no dot after @) */
const invalidEmail = fc.oneof(
  fc.string({ minLength: 1 }).filter((s) => !s.includes('@')),
  fc.string({ minLength: 1 }).map((s) => `${s}@nodot`)
)

// ---------------------------------------------------------------------------
// Property 8: Contact form rejects submissions missing required fields
// Validates: Requirements 6.3
// ---------------------------------------------------------------------------

describe('validateContactForm', () => {
  /**
   * **Validates: Requirements 6.3**
   *
   * Property 8: For any form object missing at least one required field
   * (name, email, or message), validateContactForm must return a non-empty
   * error map with an entry for each missing/invalid required field.
   */
  it('Property 8: rejects any form missing at least one required field', () => {
    // Generate forms where at least one of name/email/message is missing
    const missingNameArb = fc.record({
      name: emptyString,
      email: validEmail,
      message: nonEmptyString,
    })

    const missingEmailArb = fc.record({
      name: nonEmptyString,
      email: emptyString,
      message: nonEmptyString,
    })

    const missingMessageArb = fc.record({
      name: nonEmptyString,
      email: validEmail,
      message: emptyString,
    })

    const invalidEmailArb = fc.record({
      name: nonEmptyString,
      email: invalidEmail,
      message: nonEmptyString,
    })

    const invalidFormArb = fc.oneof(
      missingNameArb,
      missingEmailArb,
      missingMessageArb,
      invalidEmailArb
    )

    fc.assert(
      fc.property(invalidFormArb, (form) => {
        const errors = validateContactForm(form)

        // There must be at least one error
        expect(Object.keys(errors).length).toBeGreaterThan(0)

        // Each missing/invalid required field must have a corresponding error
        const trimmedName = form.name?.trim() ?? ''
        const trimmedEmail = form.email?.trim() ?? ''
        const trimmedMessage = form.message?.trim() ?? ''

        if (!trimmedName) {
          expect(errors.name).toBeTruthy()
        }

        if (!trimmedEmail) {
          expect(errors.email).toBeTruthy()
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(trimmedEmail)) {
            expect(errors.email).toBeTruthy()
          }
        }

        if (!trimmedMessage) {
          expect(errors.message).toBeTruthy()
        }
      }),
      { numRuns: 100 }
    )
  })

  it('returns no errors for a fully valid form', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: nonEmptyString,
          email: validEmail,
          message: nonEmptyString,
        }),
        (form) => {
          const errors = validateContactForm(form)
          expect(Object.keys(errors).length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns name error when name is empty', () => {
    const errors = validateContactForm({ name: '', email: 'test@example.com', message: 'hello' })
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeUndefined()
    expect(errors.message).toBeUndefined()
  })

  it('returns email error when email is empty', () => {
    const errors = validateContactForm({ name: 'Alice', email: '', message: 'hello' })
    expect(errors.email).toBeTruthy()
    expect(errors.name).toBeUndefined()
    expect(errors.message).toBeUndefined()
  })

  it('returns email error when email format is invalid', () => {
    const errors = validateContactForm({ name: 'Alice', email: 'not-an-email', message: 'hello' })
    expect(errors.email).toBeTruthy()
  })

  it('returns message error when message is empty', () => {
    const errors = validateContactForm({ name: 'Alice', email: 'test@example.com', message: '' })
    expect(errors.message).toBeTruthy()
    expect(errors.name).toBeUndefined()
    expect(errors.email).toBeUndefined()
  })

  it('returns multiple errors when multiple required fields are missing', () => {
    const errors = validateContactForm({ name: '', email: '', message: '' })
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
    expect(errors.message).toBeTruthy()
  })
})
