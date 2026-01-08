# Infrastructure Mappers

Data transformation mappers between layers.

## Overview

This directory contains mapper functions that transform data between different layers (e.g., domain entities to DTOs, external API responses to domain models).

## Contents

- **subscriptionMapper.ts** - Maps between subscription entities and external formats
- **creditsMapper.ts** - Maps between credit entities and Firestore documents

## Purpose

Mappers provide clean separation between layers:

## Related

- [Models](../models/README.md)
- [Domain](../../domain/README.md)
