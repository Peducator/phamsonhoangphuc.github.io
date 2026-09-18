'use strict';

const {
  fail,
  now,
  pickFrom,
  vString,
  vStringArray,
  vPathOrUrl,
  vUrl,
  isPlainObject,
  assertValid,
} = require('./shared');
const store = require('../data/store');

const MAX_TECHNOLOGIES = 12; // README 6.3: tối đa 12 — Technologies (React, Next.js, TypeScript, Node.js, Docker, AWS)

function clean(body, { partial }) {
  const errors = [];
  const out = {};

  out.name = vString(errors, 'name', body.name, { required: !partial, max: 80 });
  out.headline = vString(errors, 'headline', body.headline, { required: !partial, max: 120 });
  out.bio = vString(errors, 'bio', body.bio, { max: 1000 });
  out.location = vString(errors, 'location', body.location, { max: 120 });
  out.email = vString(errors, 'email', body.email, { max: 200 });
  out.avatar = vPathOrUrl(errors, 'avatar', body.avatar);
  out.heroCharacter = vPathOrUrl(errors, 'heroCharacter', body.heroCharacter);
  out.cvUrl = vPathOrUrl(errors, 'cvUrl', body.cvUrl);

  // technologies: mảng { label, icon, color } — mỗi phần tử có validate riêng (README 6.3).
  if (body.technologies !== undefined) {
    if (body.technologies === null) {
      out.technologies = null;
    } else if (Array.isArray(body.technologies)) {
      if (body.technologies.length > MAX_TECHNOLOGIES) {
        errors.push(`"technologies" tối đa ${MAX_TECHNOLOGIES} phần tử`);
      } else {
        const techs = [];
        body.technologies.forEach((tech, i) => {
          if (!isPlainObject(tech)) {
            errors.push(`"technologies[${i}]" phải là object { label, icon, color }`);
            return;
          }
          const sub = [];
          const label = vString(sub, 'label', tech.label, { required: true, max: 40 });
          const icon = vString(sub, 'icon', tech.icon, { max: 60 });
          let color = vString(sub, 'color', tech.color, { max: 7 });
          if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
            sub.push('"color" phải dạng #rrggbb');
          }
          if (sub.length === 0) {
            techs.push({ label, icon: icon || '', color: (color || '').toLowerCase() });
          } else {
            errors.push(`"technologies[${i}]": ${sub.join('; ')}`);
          }
        });
        if (errors.length === 0) out.technologies = techs;
      }
    } else {
      errors.push('"technologies" phải là mảng');
    }
  }

  // socials: chỉ nhận khoá trong danh sách trắng, mỗi giá trị phải là https URL (README 6.3).
  if (body.socials !== undefined) {
    if (body.socials === null) {
      out.socials = null;
    } else if (isPlainObject(body.socials)) {
      const socials = {};
      for (const key of ['github', 'linkedin', 'x', 'facebook']) {
        const value = vUrl(errors, `socials.${key}`, body.socials[key], { max: 500 });
        if (value !== undefined && value !== null) socials[key] = value;
      }
      out.socials = socials;
    } else {
      errors.push('"socials" phải là object { github, linkedin, x, facebook }');
    }
  }

  assertValid(errors);
  return out;
}

function get() {
  return store.read('profile');
}

function update(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'VALIDATION_ERROR', 'Body phải là object.');
  }
  if (Object.keys(body).length === 0) {
    fail(400, 'VALIDATION_ERROR', 'Body rỗng — các trường có thể sửa: name, headline, bio, location, email, avatar, heroCharacter, cvUrl, technologies, socials.');
  }

  const record = get();
  const data = clean(body, { partial: true });

  for (const [key, value] of Object.entries(pickFrom(data, ['name', 'headline', 'bio', 'location', 'email', 'avatar', 'heroCharacter', 'cvUrl', 'technologies', 'socials']))) {
    if (value !== undefined) record[key] = value;
  }
  record.updatedAt = now();

  store.write('profile', record);
  return record;
}

module.exports = { get, update };
