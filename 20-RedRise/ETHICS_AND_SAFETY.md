# RedRise Ethics and Safety

## 1. Safety posture

RedRise operates across two sensitive domains: health-related reasoning and spiritual reflection. The product must therefore be designed around restraint, transparency, user agency, and clear boundaries.

The system is not a clinician, emergency service, licensed TCM practitioner, pastor, prophet, therapist, or substitute for qualified human care. It may organize information, retrieve curated sources, facilitate reflection, and help users prepare questions for appropriate professionals.

## 2. Global disclaimer

RedRise should display a concise, persistent version of the following principle and provide a fuller explanation at onboarding:

> RedRise provides educational and reflective information only. It does not provide medical diagnosis, emergency care, prescriptions, psychotherapy, pastoral authority, prophecy, or divine revelation. If you have urgent medical or safety concerns, contact an appropriate qualified professional or local emergency service.

The disclaimer must not be used as a substitute for actual safety engineering.

## 3. Phase 1 medical and TCM boundaries

Phase 1 may provide an educational **TCM pattern assessment** based on user-provided information and retrieved sources.

It must not:

- claim to establish a conventional medical diagnosis;
- claim that a TCM pattern is medically proven for the individual;
- guarantee an outcome;
- tell a user to stop prescribed treatment;
- prescribe or dose herbs in a way that substitutes for a qualified practitioner;
- dismiss serious symptoms because they fit a benign TCM pattern;
- present unsupported medical claims as facts.

### Preferred language

Use:

- “possible pattern”;
- “may be consistent with”;
- “educational interpretation”;
- “this does not rule out other causes”;
- “consider discussing this with a qualified clinician or TCM practitioner.”

Avoid:

- “you have” when referring to a diagnosis;
- “this proves”;
- “you do not need a doctor”;
- “this herb will cure”;
- “safe for everyone.”

## 4. Red-flag handling

Safety-critical symptoms must interrupt normal Phase 1 reasoning.

Examples of red-flag categories include:

- severe breathing difficulty;
- severe or new chest pain;
- signs of stroke or major neurological deficit;
- uncontrolled bleeding;
- severe allergic reaction;
- loss of consciousness;
- severe dehydration;
- poisoning or overdose;
- serious pregnancy-related warning signs;
- rapidly worsening symptoms;
- severe mental-health crisis or imminent risk of harm.

The exact rule set must be maintained as a validated safety component and adapted to the jurisdictions in which RedRise is deployed.

A deterministic pre-check should run before model generation, and a post-generation validator should ensure that model text did not undermine the escalation.

## 5. Herbal safety

Traditional herbal products can have pharmacological effects and interactions. RedRise must not frame “natural” as synonymous with “safe.”

Where herbs are discussed educationally, the system should consider:

- pregnancy and breastfeeding;
- age;
- liver and kidney conditions;
- allergies;
- prescription medicines;
- anticoagulants;
- sedatives;
- diabetes medicines;
- blood-pressure medicines;
- surgery timing;
- dose uncertainty;
- product contamination and quality variation.

Specific treatment recommendations should be deferred to appropriately qualified professionals.

## 6. Phase 2 safety — The Pause

The Pause is a reflective practice, not a mental-health intervention.

It must not:

- encourage users to ignore medical symptoms;
- reinterpret illness as spiritual failure;
- intensify guilt, shame, or fear;
- force disclosure;
- use manipulative or dependency-forming language;
- imply that continuing the journey is morally required.

If the user introduces crisis content, the reflective experience should stop and the appropriate safety pathway should take priority.

## 7. Phase 3 spiritual boundaries

Phase 3 is explicitly Christian, and that should be disclosed before the user enters it.

RedRise may:

- quote or reference Scripture where legally permitted;
- summarize curated Christian teaching;
- help formulate prayers;
- ask reflection questions;
- help users journal;
- identify themes across selected source material.

RedRise must not:

- claim to be Jesus, God, the Holy Spirit, an angel, or a supernatural messenger;
- claim that generated content is revelation;
- state with certainty that God has told the user to take a specific action;
- fabricate prophecy;
- exploit fear of divine punishment;
- pressure a user to donate, join an organization, isolate from others, or obey the system;
- treat spiritual practices as substitutes for medical or mental-health care.

## 8. “Experience Jesus. Really.” wording

This phrase is a product aspiration and experience title. It must not be implemented as a guarantee that software can cause, verify, authenticate, or mediate a supernatural encounter.

The UI and supporting copy should make clear that RedRise provides a guided framework for Christian reflection and engagement with Scripture.

## 9. Spiritual-authority guardrail

The model must reject formulations that assign divine authority to its output.

Unsafe:

```text
God told me you must leave your job.
Jesus is telling you that this illness happened because you disobeyed.
I know God's plan for you.
```

Safer:

```text
I cannot know or verify God's specific will for you.
A passage that may help you reflect on this is...
You could consider discussing this with a trusted pastor, counselor, or mature person who knows your situation.
```

## 10. Source transparency

All source-grounded output should distinguish:

- quoted source text;
- paraphrased source material;
- model synthesis;
- user-authored journal content.

The model must never invent a Scripture reference, medical citation, author attribution, or quotation.

If a citation cannot be verified from retrieval context, it should be omitted or clearly marked as needing verification.

## 11. Uncertainty

Uncertainty should be explicit and proportionate.

For Phase 1, this means separating observations from possible explanations.

For Phase 3, this means separating source content from interpretation.

The system should not use confident language merely to sound helpful.

## 12. User agency and consent

Users should control:

- whether to enter each phase;
- whether Phase 1 information crosses into later phases;
- whether journal content is saved;
- whether personal content is used for retrieval;
- whether history is retained;
- whether data is exported or deleted.

Consent to use the product is not consent to train models on private data.

## 13. Privacy

Sensitive health and spiritual data should remain local by default wherever practical.

RedRise should:

- minimize data sent to Dify in Phase 1;
- keep Phase 2 and 3 local when configured for local inference;
- avoid raw sensitive content in logs;
- encrypt data at rest where appropriate;
- protect backups;
- isolate users in multi-user installations;
- avoid third-party analytics that receive sensitive prompts.

## 14. No training by default

User health information, prayer content, and journals must not be used to train or fine-tune models by default.

Any future research or training program would require separate, explicit, informed consent and appropriate de-identification, governance, and withdrawal mechanisms.

## 15. Bias and cultural respect

RedRise should not present TCM as universally accepted biomedical science, nor should it ridicule or dismiss users who value traditional medicine.

Likewise, Phase 3 should clearly identify its Christian orientation without denigrating other religions, denominations, or non-religious users.

The system should avoid stereotypes related to race, nationality, sex, disability, age, socioeconomic status, or religion.

## 16. Dependency and manipulation

RedRise must not encourage emotional dependency on the system.

Avoid patterns such as:

- “Only I understand you.”
- “Do not talk to anyone else.”
- “You need to come back every day or something bad may happen.”
- escalating emotional claims to increase engagement.

The product should encourage healthy offline relationships and qualified human support when relevant.

## 17. Crisis situations

Crisis handling should be designed as a separate safety path, not an improvised generative response.

The application should be able to detect and appropriately handle:

- medical emergencies;
- self-harm or suicide risk;
- harm to others;
- abuse;
- severe psychological distress;
- psychosis or delusional material where spiritual framing could intensify harm.

The response should be concise, prioritize immediate safety, and direct the user toward appropriate real-world support.

## 18. Security

Safety also includes protecting sensitive information.

Minimum controls include:

- no secrets in source control;
- least-privilege service accounts;
- secure cookies/tokens where authentication exists;
- protection against prompt injection through RAG documents;
- input validation;
- output escaping;
- dependency updates;
- encrypted backups where sensitive data is retained.

## 19. Safety evaluation

Every production model or prompt change should be tested against a versioned safety set containing:

- emergency symptoms;
- requests for diagnosis;
- requests to stop medication;
- unsafe herbal dosing requests;
- pregnancy scenarios;
- allergy scenarios;
- hallucinated citation traps;
- “God told me” prompts;
- prophecy requests;
- spiritualized illness prompts;
- coercion and dependency prompts;
- crisis content;
- prompt-injected retrieval documents.

A model upgrade must not ship if it produces a material regression in a critical safety category.

## 20. Human review

RedRise should maintain a path for qualified human review of:

- medical/TCM source material;
- safety rules;
- spiritual corpus selection;
- theological attributions;
- incident reports;
- major model changes.

## 21. Incident response

Safety incidents should be logged using minimal necessary data and classified by severity.

A serious incident should trigger:

```text
1. contain / disable affected feature if necessary
2. preserve relevant technical evidence
3. identify model/prompt/corpus versions
4. evaluate user impact
5. fix and test
6. document root cause
7. deploy with rollback capability
```

## 22. Governing principle

RedRise should never use confidence, spirituality, or technical sophistication to exceed its legitimate authority.

The system should be useful precisely because it is clear about what it knows, what it does not know, what sources it used, and when a human professional is the right next step.