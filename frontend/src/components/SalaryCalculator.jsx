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
    const [calculated, setCalculated] = useState({});

    useEffect(() => {
        const result = calculateSalary(wage, pfRate, professionalTax, standardAllowance);
        setCalculated(result);
        if (onChange) {
            onChange(result);
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
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    section: {
        background: '#1a1a2e',
        borderRadius: 12,
        padding: '1.25rem',
        border: '1px solid #ffffff10',
    },
    sectionTitle: {
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#fff',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.85rem',
        color: '#a0a0b0',
        fontWeight: 500,
    },
    input: {
        background: '#0f0f23',
        border: '1px solid #ffffff20',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        color: '#fff',
        fontSize: '1rem',
    },
    disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr',
        padding: '0.75rem 1rem',
        background: '#0f0f23',
        borderRadius: 8,
        fontSize: '0.8rem',
        color: '#a0a0b0',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr',
        padding: '0.75rem 1rem',
        background: '#16162a',
        borderRadius: 8,
        alignItems: 'center',
        fontSize: '0.9rem',
    },
    calc: {
        color: '#a0a0b0',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    amount: {
        color: '#38ef7d',
        fontWeight: 600,
        textAlign: 'right',
    },
    highlight: {
        background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
        border: '1px solid #667eea40',
    },
    totalRow: {
        background: 'linear-gradient(135deg, #11998e20 0%, #38ef7d20 100%)',
        border: '1px solid #38ef7d40',
        marginTop: '0.5rem',
    },
    deductionTotal: {
        background: 'linear-gradient(135deg, #f5576c20 0%, #f093fb20 100%)',
        border: '1px solid #f5576c40',
    },
    totalLabel: {
        fontWeight: 700,
        color: '#fff',
    },
    totalAmount: {
        fontWeight: 700,
        color: '#38ef7d',
        textAlign: 'right',
        fontSize: '1.1rem',
    },
    inlineInput: {
        width: 60,
        background: '#0f0f23',
        border: '1px solid #ffffff30',
        borderRadius: 4,
        padding: '0.25rem 0.5rem',
        color: '#fff',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    netSection: {
        marginTop: '0.5rem',
    },
    netCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    netLabel: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#fff',
    },
    netAmount: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#fff',
    },
};
