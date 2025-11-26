import React from "react";
import { Sparkles, Palette, Type, Layout, MousePointer, Zap } from "lucide-react";

export default function DesignGuide() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="container-studio section-spacing">
        
        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Sparkles size={28} color="white" />
            </div>
            <div>
              <h1 className="text-display gradient-text">DishCore Studio™ UI Guide</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Premium medical-grade design system
              </p>
            </div>
          </div>
        </div>

        {/* Color System */}
        <section className="studio-card-glow" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Palette size={24} style={{ color: 'var(--accent-primary)' }} />
              Color System
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Primary Accent', var: '--accent-primary', desc: 'DishCore signature' },
                { name: 'Secondary Accent', var: '--accent-secondary', desc: 'Complementary' },
                { name: 'Success', var: '--success', desc: 'Positive actions' },
                { name: 'Warning', var: '--warning', desc: 'Alerts' },
                { name: 'Danger', var: '--danger', desc: 'Critical' },
                { name: 'Link', var: '--link', desc: 'Interactive' }
              ].map(color => (
                <div key={color.name} style={{
                  padding: '16px',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-soft)'
                }}>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    background: `var(${color.var})`,
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{color.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{color.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="studio-card-glow" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Type size={24} style={{ color: 'var(--accent-primary)' }} />
              Typography Scale
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p className="text-display">Display Text</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  40px, Bold, -2% letter-spacing
                </p>
              </div>
              <div>
                <p className="text-h1">Heading 1</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  32px, Bold, -1% letter-spacing
                </p>
              </div>
              <div>
                <p className="text-h2">Heading 2</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  24px, Semibold
                </p>
              </div>
              <div>
                <p className="text-h3">Heading 3</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  20px, Semibold
                </p>
              </div>
              <div>
                <p className="text-body">Body Text</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  16px, Regular
                </p>
              </div>
              <div>
                <p className="text-kpi">98.5</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  KPI Numbers: 32px, Semibold, Tabular nums
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="studio-card-glow" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MousePointer size={24} style={{ color: 'var(--accent-primary)' }} />
              Button Styles
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-tertiary">Tertiary Button</button>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="studio-card-glow" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layout size={24} style={{ color: 'var(--accent-primary)' }} />
              Components
            </h2>
            
            {/* Metric Cards */}
            <h3 className="text-h3" style={{ marginBottom: '16px', marginTop: '24px' }}>Metric Cards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="metric-card">
                <p className="metric-label">Steps Today</p>
                <p className="metric-value">12,458</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  +15% from avg
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-label">DishCore Score</p>
                <p className="metric-value" style={{ color: 'var(--accent-primary)' }}>85</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Excellent
                </p>
              </div>
            </div>

            {/* Chips */}
            <h3 className="text-h3" style={{ marginBottom: '16px', marginTop: '32px' }}>Chips & Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span className="studio-chip">Vegan</span>
              <span className="studio-chip">Gluten Free</span>
              <span className="studio-chip-accent">High Protein</span>
              <span className="studio-chip">Mediterranean</span>
            </div>

            {/* Input */}
            <h3 className="text-h3" style={{ marginBottom: '16px', marginTop: '32px' }}>Input Field</h3>
            <input 
              type="text" 
              className="studio-input" 
              placeholder="Enter your text..."
              style={{ maxWidth: '400px' }}
            />
          </div>
        </section>

        {/* Spacing */}
        <section className="studio-card-glow" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap size={24} style={{ color: 'var(--accent-primary)' }} />
              Spacing System
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {[
                { name: 'XS', value: '4px', var: '--spacing-xs' },
                { name: 'SM', value: '8px', var: '--spacing-sm' },
                { name: 'MD', value: '16px', var: '--spacing-md' },
                { name: 'LG', value: '24px', var: '--spacing-lg' },
                { name: 'XL', value: '32px', var: '--spacing-xl' },
                { name: '2XL', value: '48px', var: '--spacing-2xl' }
              ].map(space => (
                <div key={space.name} style={{
                  padding: '12px',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-soft)'
                }}>
                  <div style={{
                    width: space.value,
                    height: space.value,
                    background: 'var(--accent-primary)',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }} />
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{space.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{space.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="studio-card-glow">
          <div className="studio-card">
            <h2 className="text-h2" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Design Principles
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                {
                  title: 'Premium & Clinical',
                  desc: 'High-end lifestyle aesthetic meets medical-grade clarity'
                },
                {
                  title: 'Data-First',
                  desc: 'Numbers and metrics are heroes, presented with clarity'
                },
                {
                  title: 'Calm & Focused',
                  desc: 'Generous spacing, minimal noise, no clutter'
                },
                {
                  title: 'Subtle Motion',
                  desc: 'Smooth transitions (150-250ms), gentle hover states'
                },
                {
                  title: 'Accessible',
                  desc: 'High contrast ratios, clear focus states, legible typography'
                }
              ].map((principle, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-soft)'
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{principle.title}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{principle.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}