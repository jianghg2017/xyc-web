/**
 * Standalone Property-Based Test for Contact form required field validation
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 6.3**
 *
 * Property 8: Contact form rejects submissions missing required fields
 * For arbitrary form objects missing at least one of name/email/message,
 * validateContactForm must return errors for each missing/invalid required field.
 */

import fc from 'fast-check'

// ---------------------------------------------------------------------------
// Pure validation logic extracted from Contact/index.tsx
// ---------------------------------------------------------------------------

/**
 * Validates a contact form submission.
 * Required fields: name, email (with format check), message.
 * Returns a per-field error map; empty object means valid.
 */
function validateContactForm(data) {
  const errors = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = '请输入姓名'
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = '请输入邮箱'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = '请输入有效的邮箱地址'
    }
  }

  if (!data.message || data.message.trim() === '') {
    errors.message = '请输入咨询内容'
  }

  return errors
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty trimmed string (simulates a filled field) */
const nonEmptyString = fc
  .string({ minLength: 1 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for an empty or whitespace-only string (simulates a missing field) */
const emptyString = fc.oneof(
  fc.constant(''),
  fc
    .string({ minLength: 1, maxLength: 5 })
    .map((s) => ' '.repeat(s.length))
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
// Test runner
// ---------------------------------------------------------------------------

let passed = 0
let failed = 0

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function runTest(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${e.message}`)
    failed++
  }
}

console.log('\nContact form required field validation (Property 8)')
console.log('Validates: Requirements 6.3\n')

// ---------------------------------------------------------------------------
// Property 8: rejects forms missing name
// ---------------------------------------------------------------------------

runTest('Property 8: rejects form when name is missing', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: emptyString,
        email: validEmail,
        message: nonEmptyString,
      }),
      (form) => {
        const errors = validateContactForm(form)
        assert(Object.keys(errors).length > 0, 'Expected at least one error')
        assert(!!errors.name, `Expected errors.name to be set, got: ${JSON.stringify(errors)}`)
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 8: rejects forms missing email
// ---------------------------------------------------------------------------

runTest('Property 8: rejects form when email is missing', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: nonEmptyString,
        email: emptyString,
        message: nonEmptyString,
      }),
      (form) => {
        const errors = validateContactForm(form)
        assert(Object.keys(errors).length > 0, 'Expected at least one error')
        assert(!!errors.email, `Expected errors.email to be set, got: ${JSON.stringify(errors)}`)
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 8: rejects forms with invalid email format
// ---------------------------------------------------------------------------

runTest('Property 8: rejects form when email format is invalid', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: nonEmptyString,
        email: invalidEmail,
        message: nonEmptyString,
      }),
      (form) => {
        const errors = validateContactForm(form)
        assert(Object.keys(errors).length > 0, 'Expected at least one error')
        assert(!!errors.email, `Expected errors.email to be set for invalid email "${form.email}", got: ${JSON.stringify(errors)}`)
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 8: rejects forms missing message
// ---------------------------------------------------------------------------

runTest('Property 8: rejects form when message is missing', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: nonEmptyString,
        email: validEmail,
        message: emptyString,
      }),
      (form) => {
        const errors = validateContactForm(form)
        assert(Object.keys(errors).length > 0, 'Expected at least one error')
        assert(!!errors.message, `Expected errors.message to be set, got: ${JSON.stringify(errors)}`)
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 8: combined — any form missing at least one required field is rejected
// ---------------------------------------------------------------------------

runTest('Property 8: any form missing at least one required field is rejected', () => {
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
      assert(Object.keys(errors).length > 0, `Expected errors for invalid form: ${JSON.stringify(form)}`)

      // Each missing/invalid required field must have a corresponding error
      const trimmedName = (form.name || '').trim()
      const trimmedEmail = (form.email || '').trim()
      const trimmedMessage = (form.message || '').trim()

      if (!trimmedName) {
        assert(!!errors.name, `Expected errors.name for empty name`)
      }

      if (!trimmedEmail) {
        assert(!!errors.email, `Expected errors.email for empty email`)
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
          assert(!!errors.email, `Expected errors.email for invalid email "${trimmedEmail}"`)
        }
      }

      if (!trimmedMessage) {
        assert(!!errors.message, `Expected errors.message for empty message`)
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Positive property: valid form produces no errors
// ---------------------------------------------------------------------------

runTest('valid form with all required fields produces no errors', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: nonEmptyString,
        email: validEmail,
        message: nonEmptyString,
      }),
      (form) => {
        const errors = validateContactForm(form)
        assert(
          Object.keys(errors).length === 0,
          `Expected no errors for valid form, got: ${JSON.stringify(errors)}`
        )
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Edge case: all fields empty
// ---------------------------------------------------------------------------

runTest('all fields empty produces errors for all required fields', () => {
  const errors = validateContactForm({ name: '', email: '', message: '' })
  assert(!!errors.name, 'Expected errors.name')
  assert(!!errors.email, 'Expected errors.email')
  assert(!!errors.message, 'Expected errors.message')
})

// ---------------------------------------------------------------------------
// Edge case: whitespace-only fields treated as empty
// ---------------------------------------------------------------------------

runTest('whitespace-only name is treated as missing', () => {
  const errors = validateContactForm({ name: '   ', email: 'test@example.com', message: 'hello' })
  assert(!!errors.name, 'Expected errors.name for whitespace-only name')
})

runTest('whitespace-only message is treated as missing', () => {
  const errors = validateContactForm({ name: 'Alice', email: 'test@example.com', message: '   ' })
  assert(!!errors.message, 'Expected errors.message for whitespace-only message')
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
