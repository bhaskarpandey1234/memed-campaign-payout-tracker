import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Button } from './index';

describe('Button', () => {
  it('announces its loading label and prevents repeated clicks', () => {
    render(createElement(Button, { loading: true, loadingLabel: 'Saving campaign…' }, 'Save'));
    expect(screen.getByRole('button', { name: 'Saving campaign…' })).toBeDisabled();
  });
});
