import { store, SyntheticCandidate } from '../services/store.service.js';

export interface ToolExecutionResponse {
  success: boolean;
  tool: string;
  data: any;
  message: string;
}

export async function executeRecruitAssistTool(
  toolName: string,
  parameters: Record<string, any>
): Promise<ToolExecutionResponse> {
  switch (toolName) {
    case 'read_resume': {
      const candidateId = parameters.candidateId || 'cand-001';
      const candidate = store.getCandidateById(candidateId);
      if (!candidate) {
        return {
          success: false,
          tool: toolName,
          data: null,
          message: `Candidate with ID '${candidateId}' not found.`
        };
      }
      return {
        success: true,
        tool: toolName,
        data: {
          candidateId: candidate.id,
          name: candidate.name,
          role: candidate.role,
          skills: candidate.skills,
          experienceYears: candidate.experienceYears,
          education: candidate.education,
          resumeSnippet: candidate.resumeText.slice(0, 300)
        },
        message: `Successfully read synthetic resume profile for ${candidate.name}.`
      };
    }

    case 'search_internal_candidates': {
      const skillFilter = (parameters.skill || '').toLowerCase();
      const allCandidates = store.getCandidates();
      const matched = allCandidates.filter((c) => {
        if (!skillFilter) return true;
        return c.skills.some((s) => s.toLowerCase().includes(skillFilter)) ||
               c.role.toLowerCase().includes(skillFilter);
      });

      return {
        success: true,
        tool: toolName,
        data: {
          matchCount: matched.length,
          candidates: matched.map((c) => ({
            id: c.id,
            name: c.name,
            role: c.role,
            skills: c.skills,
            experienceYears: c.experienceYears
          }))
        },
        message: `Found ${matched.length} candidates matching search criteria.`
      };
    }

    case 'create_shortlist': {
      const title = parameters.shortlistTitle || 'Engineering Shortlist';
      const candidateIds: string[] = parameters.candidateIds || ['cand-001', 'cand-002'];
      return {
        success: true,
        tool: toolName,
        data: {
          shortlistId: `sl-${Date.now().toString(36)}`,
          title,
          candidatesIncluded: candidateIds,
          destination: 'internal://db/shortlists',
          createdAt: new Date().toISOString()
        },
        message: `Shortlist '${title}' saved to internal recruitment database.`
      };
    }

    case 'save_report': {
      const reportTitle = parameters.reportTitle || 'Screening Summary Report';
      return {
        success: true,
        tool: toolName,
        data: {
          reportId: `rep-${Date.now().toString(36)}`,
          title: reportTitle,
          destination: 'internal://storage/reports',
          savedAt: new Date().toISOString()
        },
        message: `Report '${reportTitle}' saved to internal encrypted storage.`
      };
    }

    case 'create_calendar_event': {
      const eventTitle = parameters.eventTitle || 'Technical Screen Interview';
      return {
        success: true,
        tool: toolName,
        data: {
          calendarEventId: `cal-${Date.now().toString(36)}`,
          eventTitle,
          scheduledTime: parameters.scheduledTime || '2026-10-15T14:00:00Z',
          destination: 'internal://calendar/schedules'
        },
        message: `Interview calendar event '${eventTitle}' booked internally.`
      };
    }

    case 'send_email': {
      return {
        success: true,
        tool: toolName,
        data: {
          messageId: `msg-${Date.now().toString(36)}`,
          recipient: parameters.recipientEmail || 'recruiter@example.test',
          subject: parameters.subject || 'Candidate Shortlist Update',
          sentAt: new Date().toISOString()
        },
        message: `Notification email dispatched to ${parameters.recipientEmail}.`
      };
    }

    case 'export_report': {
      return {
        success: true,
        tool: toolName,
        data: {
          exportJobId: `exp-${Date.now().toString(36)}`,
          format: parameters.reportFormat || 'PDF',
          targetEndpoint: parameters.destinationEndpoint || 'external://recruitment-export',
          recordCount: Array.isArray(parameters.candidateIds) ? parameters.candidateIds.length : 1
        },
        message: `Report successfully exported to external target.`
      };
    }

    default:
      throw new Error(`Tool '${toolName}' is not registered in ScopeSeal boundary.`);
  }
}
