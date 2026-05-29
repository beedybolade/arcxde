import {
  type GetOnboardingQuestionsQuery,
  getOnboardingQuestionsQuerySchema,
  type OnboardingQuestion,
  type OnboardingResult,
  type SubmitOnboardingBody,
  submitOnboardingBodySchema,
} from '@app/contracts';
import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodBody, ZodQuery } from '../../common/validation/zod.decorators.js';

import { OnboardingService } from './onboarding.service.js';

@ApiTags('onboarding')
@Controller({ path: 'onboarding', version: '1' })
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get('questions')
  async getQuestions(
    @ZodQuery(getOnboardingQuestionsQuerySchema) query: GetOnboardingQuestionsQuery,
  ): Promise<{ data: OnboardingQuestion[] }> {
    return { data: await this.service.getQuestions(query.role) };
  }

  @Post('submit')
  @HttpCode(200)
  async submit(
    @ZodBody(submitOnboardingBodySchema) body: SubmitOnboardingBody,
  ): Promise<{ data: OnboardingResult }> {
    return { data: await this.service.submit(body) };
  }
}
