# Infrastructure Models

Data models and schemas used by the infrastructure layer.

## Overview

This directory contains data models, schemas, and interfaces used by infrastructure implementations.

## Contents

- **SubscriptionModel.ts** - Subscription data model for persistence/transport
- **CreditsModel.ts** - Credits data model for Firestore

## Purpose

Models provide structure for data storage and API communication:

- **Validation**: Ensure data integrity
- **Serialization**: Convert to/from storage formats
- **Type Safety**: Provide TypeScript interfaces

## Related

- [Repositories](../repositories/README.md)
- [Services](../services/README.md)
- [Domain Entities](../../domain/entities/README.md)
