/* Admin lock for the love box. Safe to publish: her box is encrypted with the public key,
   and only the admin page + your password can open it. Don't edit by hand. */
window.LOVE_ADMIN = {
  "store": "lovebox-4a84f92a-5251-4398-8c78-2831509b1fcd",
  "pub": {
    "kty": "EC",
    "crv": "P-256",
    "x": "9cYiL7YCGrG0oJy0Oo6Dm5R4-I4N0Yyu_elD19daxTE",
    "y": "o5Huswf9aeCe-_jU1nEtraeCvTAhWrjHb4m7Yi9UBuQ"
  },
  "lock": {
    "salt": "HNYYOnJ2aTPM6Bhbxhrf7Q==",
    "iv": "v78EIr7CjU5dXNw1",
    "ct": "h7hVFp1aCJRKAKFB50AeTGSQFqLLcgw96TW9ibFz/NgIxxz3wrJbBFKP56re+gt4EuEMZo+2tGGLXfQl0i3RM+8sRigE7WMpb7lo8FR4JAaJjpEusYVj/EY/e7ArP82ltNFhUv/03Qb2qWiGwmIk8NE5rG0yLqUab8S9eCDn6cn024M7G8k5A2rW0FR8OcNTZv3R8X0F/aKkFw==",
    "iterations": 600000
  }
};
