import React, { useState, useEffect } from 'react';

// Calculate salary components based on wage
export function calculateSalary(wage, pfRate = 12, professionalTax = 200, standardAllowance = 4167) {
    const basic = Math.round(wage * 0.50);
    const hra = Math.round(basic * 0.50);
    const performanceBonus = Math.round(wage * 0.0833);
    const lta = Math.round(wage * 0.08333);

    const subtotal = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, wage - subtotal);

    const pfAmount = Math.round(basic * (pfRate / 100));

    const grossSalary = wage;
    const totalDeductions = pfAmount + professionalTax;
    const netSalary = grossSalary - totalDeductions;

    return {
        wage,
        basic,
        hra,
        standardAllowance,
        performanceBonus,
        lta,
        fixedAllowance,
        pfRate,
        pfAmount,
        professionalTax,
        grossSalary,
        totalDeductions,
        netSalary
    };
}

export default function SalaryCalculator({ salaryDetails, onChange, readOnly = false }) {
    const [wage, setWage] = useState(salaryDetails?.wage || 0);
    const [pfRate, setPfRate] = useState(salaryDetails?.pfRate || 12);
    const [professionalTax, setProfessionalTax] = useState(salaryDetails?.professionalTax || 200);
    const [standardAllowance, setStandardAllowance] = useState(salaryDetails?.standardAllowance || 4167);

    // Calculate immediately with current values
    const calculated = calculateSalary(wage, pfRate, professionalTax, standardAllowance);

    // Notify parent when values change
    useEffect(() => {
        if (onChange) {
            onChange(calculated);
        }
    }, [wage, pfRate, professionalTax, standardAllowance]);

    useEffect(() => {
        if (salaryDetails?.wage && salaryDetails.wage !== wage) {
            setWage(salaryDetails.wage);
        }
    }, [salaryDetails]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    return (
        <div style={styles.container}>
            {/* Wage Input */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💰 Wage Configuration</h3>
                <div style={styles.grid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Wage Type</label>
                        <input
                            type="text"
                            value="Fixed"
                            disabled
                            style={{ ...styles.input, ...styles.disabled }}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Monthly Wage (₹)</label>
                        <input
                            type="number"
                            value={wage}
                            onChange={(e) => setWage(Number(e.target.value) || 0)}
                            style={styles.input}
                            disabled={readOnly}
                            placeholder="Enter wage amount"
                        />
                    </div>
                </div>
            </div>

            {/* Salary Components */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📊 Salary Components</h3>
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <span>Component</span>
                        <span>Calculation</span>
                        <span>Amount</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Basic</span>
                        <span style={styles.calc}>50% of Wage</span>
                        <span style={styles.amount}>{formatCurrency(calculated.basic)}</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>House Rent Allowance (HRA)</span>
                        <span style={styles.calc}>50% of Basic</span>
                        <span style={styles.amount}>{formatCurrency(calculated.hra)}</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Standard Allowance</span>
                        <span style={styles.calc}>
                            <input
                                type="number"
                                value={standardAllowance}
                                onChange={(e) => setStandardAllowance(Number(e.target.value) || 0)}
                                style={styles.inlineInput}
                                disabled={readOnly}
                            />
                            Fixed
                        </span>
                        <span style={styles.amount}>{formatCurrency(calculated.standardAllowance)}</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Performance Bonus</span>
                        <span style={styles.calc}>8.33% of Wage</span>
                        <span style={styles.amount}>{formatCurrency(calculated.performanceBonus)}</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Leave Travel Allowance (LTA)</span>
                        <span style={styles.calc}>8.333% of Wage</span>
                        <span style={styles.amount}>{formatCurrency(calculated.lta)}</span>
                    </div>

                    <div style={{ ...styles.tableRow, ...styles.highlight }}>
                        <span>Fixed Allowance</span>
                        <span style={styles.calc}>Wage - All Components</span>
                        <span style={styles.amount}>{formatCurrency(calculated.fixedAllowance)}</span>
                    </div>

                    <div style={{ ...styles.tableRow, ...styles.totalRow }}>
                        <span style={styles.totalLabel}>Gross Salary</span>
                        <span></span>
                        <span style={styles.totalAmount}>{formatCurrency(calculated.grossSalary)}</span>
                    </div>
                </div>
            </div>

            {/* Deductions */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📉 Deductions</h3>
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <span>Deduction</span>
                        <span>Rate/Amount</span>
                        <span>Amount</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Provident Fund (PF)</span>
                        <span style={styles.calc}>
                            <input
                                type="number"
                                value={pfRate}
                                onChange={(e) => setPfRate(Number(e.target.value) || 0)}
                                style={styles.inlineInput}
                                disabled={readOnly}
                            />
                            % of Basic
                        </span>
                        <span style={styles.amount}>{formatCurrency(calculated.pfAmount)}</span>
                    </div>

                    <div style={styles.tableRow}>
                        <span>Professional Tax</span>
                        <span style={styles.calc}>
                            ₹
                            <input
                                type="number"
                                value={professionalTax}
                                onChange={(e) => setProfessionalTax(Number(e.target.value) || 0)}
                                style={styles.inlineInput}
                                disabled={readOnly}
                            />
                            Fixed
                        </span>
                        <span style={styles.amount}>{formatCurrency(calculated.professionalTax)}</span>
                    </div>

                    <div style={{ ...styles.tableRow, ...styles.totalRow, ...styles.deductionTotal }}>
                        <span style={styles.totalLabel}>Total Deductions</span>
                        <span></span>
                        <span style={styles.totalAmount}>{formatCurrency(calculated.totalDeductions)}</span>
                    </div>
                </div>
            </div>

            {/* Net Salary */}
            <div style={styles.netSection}>
                <div style={styles.netCard}>
                    <span style={styles.netLabel}>Net Salary (Take Home)</span>
                    <span style={styles.netAmount}>{formatCurrency(calculated.netSalary)}</span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    section: { background: '#141414', borderRadius: 8, padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' },
    sectionTitle: { margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 500, color: '#fff' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 },
    input: { background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.85rem' },
    disabled: { opacity: 0.5, cursor: 'not-allowed' },
    table: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', padding: '0.5rem 0.75rem', background: '#0a0a0a', borderRadius: 6, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', padding: '0.6rem 0.75rem', background: '#111', borderRadius: 6, alignItems: 'center', fontSize: '0.8rem' },
    calc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    amount: { color: '#22c55e', fontWeight: 600, textAlign: 'right' },
    highlight: { background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' },
    totalRow: { background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', marginTop: '0.35rem' },
    deductionTotal: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' },
    totalLabel: { fontWeight: 600, color: '#fff' },
    totalAmount: { fontWeight: 600, color: '#22c55e', textAlign: 'right', fontSize: '0.95rem' },
    inlineInput: { width: 55, background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, padding: '0.2rem 0.4rem', color: '#fff', fontSize: '0.75rem', textAlign: 'center' },
    netSection: { marginTop: '0.35rem' },
    netCard: { background: '#3b82f6', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    netLabel: { fontSize: '0.95rem', fontWeight: 500, color: '#fff' },
    netAmount: { fontSize: '1.5rem', fontWeight: 600, color: '#fff' },
};
