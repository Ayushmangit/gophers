# Changelog

## [1.1.7](https://github.com/Ayushmangit/gophers/compare/v1.1.6...v1.1.7) (2026-08-14)


### Features

* added getAllPosts in backend and explore page on the frontend ([00ea1f5](https://github.com/Ayushmangit/gophers/commit/00ea1f598b7211baba4e7fc9dcd81444bc64d297))
* Adding All posts for explore ([1bb2ae0](https://github.com/Ayushmangit/gophers/commit/1bb2ae00eeeef175a0f76918a6355aa7dc7bcc1f))
* Explore frontend is showing all the posts , need to add limit and offset later to both the frontend and the backend ([674af25](https://github.com/Ayushmangit/gophers/commit/674af2554372047e6570668f6ec99a12bb71b1d1))

## [1.1.6](https://github.com/Ayushmangit/gophers/compare/v1.1.5...v1.1.6) (2026-08-13)


### Features

* user search is enabled now ([96721ec](https://github.com/Ayushmangit/gophers/commit/96721ec35182c7cd7661d830d7b3d302c6cfd029))


### Bug Fixes

* Major fixes in Backend comments, posts, i was returning null collections i should never do it again ([5fdea19](https://github.com/Ayushmangit/gophers/commit/5fdea19fb17ef74347a7632709d6864e6a932fa8))

## [1.1.5](https://github.com/Ayushmangit/gophers/compare/v1.1.4...v1.1.5) (2026-08-11)


### Features

* added is_following to the backend so i can now check if the logged in user follows somebody or not ([38ef308](https://github.com/Ayushmangit/gophers/commit/38ef3081a1c045fedb45c4a4f06e05226b55fd2a))


### Bug Fixes

* TEMP removed some tests ([3f6dc90](https://github.com/Ayushmangit/gophers/commit/3f6dc90c5c774424318832bec92ee0bb495e94c3))

## [1.1.4](https://github.com/Ayushmangit/gophers/compare/v1.1.3...v1.1.4) (2026-08-11)


### Features

* Added /authentication/me route to help rehydrate the frontend with some changes in queries , isActive and role_id fix in GetByID store application method ([0dd1b37](https://github.com/Ayushmangit/gophers/commit/0dd1b37c19d48a03aaf1ebfb52ecad64ca98b335))


### Bug Fixes

* Me Response struct created and async thunks created ([9220494](https://github.com/Ayushmangit/gophers/commit/922049467d52e29f8716d96854dc30011958161d))

## [1.1.3](https://github.com/Ayushmangit/gophers/compare/v1.1.2...v1.1.3) (2026-08-09)


### Features

* added profile links , will make into a component later ([14eb4cf](https://github.com/Ayushmangit/gophers/commit/14eb4cf74cb62f0ff90c318fff51ad03ea536610))


### Bug Fixes

* auth.go fixes serialized the user ([291f526](https://github.com/Ayushmangit/gophers/commit/291f5267a03fca9ddc875064b6256d821f555e70))

## [1.1.2](https://github.com/Ayushmangit/gophers/compare/v1.1.1...v1.1.2) (2026-08-09)


### Features

* Frontend work ([d433633](https://github.com/Ayushmangit/gophers/commit/d433633d36b83249daf7ac4d5f0ec54cb82e1010))


### Bug Fixes

* confirm -&gt; activate ([3db30e6](https://github.com/Ayushmangit/gophers/commit/3db30e6582335ffadff99fe9406e25850b4bd524))
* PostDetails post handler LINK's added ([c6b5eb3](https://github.com/Ayushmangit/gophers/commit/c6b5eb33a9e093ae92a92813269604ce8f9d75a2))

## [1.1.1](https://github.com/Ayushmangit/gophers/compare/v1.1.0...v1.1.1) (2026-08-08)


### Bug Fixes

* bebugging ([17e1dc8](https://github.com/Ayushmangit/gophers/commit/17e1dc8eb84de9c0028d11a0b0287ff33f87bcfd))

## [1.1.0](https://github.com/Ayushmangit/gophers/compare/v1.0.1...v1.1.0) (2026-08-08)


### Features

* dockerfile ([5c567d0](https://github.com/Ayushmangit/gophers/commit/5c567d0e5ee2e8af78f35a48b5e45fd283bc0fe0))


### Bug Fixes

* Dockerfilr ([7293c87](https://github.com/Ayushmangit/gophers/commit/7293c874078de74b2bbc1a901506bce4935f9275))

## [1.0.1](https://github.com/Ayushmangit/gophers/compare/v1.0.0...v1.0.1) (2026-08-08)


### Features

* update-version_script ([251cac9](https://github.com/Ayushmangit/gophers/commit/251cac9694d121c0454ba43f0ace8789546bc2f8))

## 1.0.0 (2026-08-08)


### Features

* add automation workflow ([0e7d224](https://github.com/Ayushmangit/gophers/commit/0e7d2243c22ca8cf6f912856baea046ec4c0e1d7))
* release please script ([d43e30e](https://github.com/Ayushmangit/gophers/commit/d43e30ee93363258cde5543b7180fefdde397aff))


### Bug Fixes

* Added role to RegisterUser handler and seed.go ([3776b2b](https://github.com/Ayushmangit/gophers/commit/3776b2bcc78eea26776e2944595112a7a8979776))
* Audit.yaml ([f45781e](https://github.com/Ayushmangit/gophers/commit/f45781e9719b29172c14f033a3c1c87a15c9b416))
* error string , unused middleware ([afafb1c](https://github.com/Ayushmangit/gophers/commit/afafb1c234a0dd8459794650f0a099cac61b08b7))
* main -&gt; master ([97f1d73](https://github.com/Ayushmangit/gophers/commit/97f1d739ca1d353b24cf36505baa2dd8b19b0290))
* main -&gt;master audit/yaml ([1e58a58](https://github.com/Ayushmangit/gophers/commit/1e58a580dc81e39a7607f221cbe1148dabaff0d4))
* removed commit ([4d787b8](https://github.com/Ayushmangit/gophers/commit/4d787b8f97fd193a024f27a0da16d9ec3697adfc))
* roles.go tagname fixed and node.js version ([c27d3c5](https://github.com/Ayushmangit/gophers/commit/c27d3c548379f86a9ab8a81b50ad52b41fc8b71c))
