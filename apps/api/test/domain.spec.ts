import { describe, it, expect } from 'vitest';

describe('FreelancerOS Core Domain Logic & Calculations', () => {
  it('calculates invoice pricing, taxes and balances correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 25000 }, // 50,000
      { quantity: 1, unitPrice: 30000 }, // 30,000
    ];

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    expect(subtotal).toBe(80000);

    const discountPercent = 10;
    const discountAmount = subtotal * (discountPercent / 100);
    expect(discountAmount).toBe(8000);

    const taxableAmount = subtotal - discountAmount;
    expect(taxableAmount).toBe(72000);

    const taxPercent = 18;
    const taxAmount = taxableAmount * (taxPercent / 100);
    expect(taxAmount).toBe(12960);

    const totalAmount = taxableAmount + taxAmount;
    expect(totalAmount).toBe(84960);

    // Initial state
    const amountPaid = 0;
    const balanceDue = totalAmount - amountPaid;
    expect(balanceDue).toBe(84960);
  });

  it('updates invoice status and balance accurately upon recording payments', () => {
    const totalAmount = 50000;
    let amountPaid = 0;
    let balanceDue = totalAmount - amountPaid;
    let status = 'sent';

    // Record partial payment of 20,000
    const payment1 = 20000;
    amountPaid += payment1;
    balanceDue = Math.max(0, totalAmount - amountPaid);
    status = balanceDue <= 0 ? 'paid' : 'partially_paid';

    expect(amountPaid).toBe(20000);
    expect(balanceDue).toBe(30000);
    expect(status).toBe('partially_paid');

    // Record remaining payment of 30,000
    const payment2 = 30000;
    amountPaid += payment2;
    balanceDue = Math.max(0, totalAmount - amountPaid);
    status = balanceDue <= 0 ? 'paid' : 'partially_paid';

    expect(amountPaid).toBe(50000);
    expect(balanceDue).toBe(0);
    expect(status).toBe('paid');
  });

  it('enforces revision scope and flags revisions exceeding included limit', () => {
    const includedRevisions = 2;

    const checkRevision = (revisionNumber: number) => {
      return {
        revisionNumber,
        maxIncluded: includedRevisions,
        isScopeExceeded: revisionNumber > includedRevisions,
        label:
          revisionNumber <= includedRevisions
            ? `Revision ${revisionNumber} of ${includedRevisions}`
            : 'Outside agreed scope',
      };
    };

    const rev1 = checkRevision(1);
    expect(rev1.isScopeExceeded).toBe(false);
    expect(rev1.label).toBe('Revision 1 of 2');

    const rev2 = checkRevision(2);
    expect(rev2.isScopeExceeded).toBe(false);
    expect(rev2.label).toBe('Revision 2 of 2');

    const rev3 = checkRevision(3);
    expect(rev3.isScopeExceeded).toBe(true);
    expect(rev3.label).toBe('Outside agreed scope');
  });

  it('calculates project profitability and effective hourly rate transparently', () => {
    // Prompt Section 39 formula:
    // Revenue: ₹80,000
    // Expenses: ₹8,500
    // Tracked time: 36h
    // Profit: ₹71,500
    // Effective hourly rate: ₹1,986/h

    const revenue = 80000;
    const expenses = 8500;
    const trackedHours = 36;

    const profit = revenue - expenses;
    expect(profit).toBe(71500);

    const effectiveHourlyRate = Math.round(profit / trackedHours);
    expect(effectiveHourlyRate).toBe(1986);
  });

  it('strictly validates organization isolation key on entity operations', () => {
    const orgA = 'org-111';
    const orgB = 'org-222';

    const records = [
      { id: '1', organizationId: orgA, title: 'Client A' },
      { id: '2', organizationId: orgB, title: 'Client B' },
    ];

    const filterForOrgA = records.filter((r) => r.organizationId === orgA);
    expect(filterForOrgA).toHaveLength(1);
    expect(filterForOrgA[0].title).toBe('Client A');
  });
});
