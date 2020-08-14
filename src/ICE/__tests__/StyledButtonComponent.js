import React from 'react';
import { shallow } from 'enzyme';
import StyledButton from "../UIcomponents/StyledButton";

describe('StyledButton', () => {
  describe('Rendering', () => {
      it('should match to snapshot - Primary', () => {
          const component = shallow(<StyledButton label="test label" primary />)
          expect(component).toMatchSnapshot("Primary button snapshot")
      });
      it('should match to snapshot - Secondary', () => {
          const component = shallow(<StyledButton label="test label" primary={false} />)
          expect(component).toMatchSnapshot("Secondary button snapshot")
      });
  });
});