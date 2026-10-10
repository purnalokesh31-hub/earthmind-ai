'use client';

import React from 'react';
import { ResourceAssignmentCenter } from '../ResourceAssignmentCenter';
import type { Incident } from '../../../types';

const AssignmentsTab: React.FC<{ incident: Incident }> = ({ incident }) => {
  return <ResourceAssignmentCenter incident={incident} />;
};

export default AssignmentsTab;
