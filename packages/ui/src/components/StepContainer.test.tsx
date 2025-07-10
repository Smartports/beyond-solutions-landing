import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import React from 'react';
import StepContainer from './StepContainer';
import { expect, it, describe } from 'vitest';
import '@testing-library/jest-dom';

describe('<StepContainer />', () => {
  const defaultProps = {
    title: 'Paso 1',
    isActive: true,
    stepId: 'step-1',
  } as const;

  it('renders children and title with no accessibility violations', async () => {
    const { getByText, container } = render(
      <StepContainer {...defaultProps}>Contenido</StepContainer>,
    );

    expect(getByText('Paso 1')).toBeInTheDocument();
    expect(getByText('Contenido')).toBeInTheDocument();

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
