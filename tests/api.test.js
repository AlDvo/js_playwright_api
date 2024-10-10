import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";

test.describe.only("API challenge", () => {
  let URL = "https://apichallenges.herokuapp.com/";
  let token;
  let payload;
  let database;
  let xAuthToken;
  let todo = {
    "title": faker.string.alpha(50),
    "doneStatus": true,
    "description": faker.string.alpha(200)
  };

  test.beforeAll(async ({ request }) => {
    // Запросить ключ авторизации
    let response = await request.post(`${URL}challenger`);
    let headers = response.headers();
    // Передаем токен в тест
    token = headers["x-challenger"];
    // Пример ассерта
    expect(headers).toEqual(
      expect.objectContaining({ "x-challenger": expect.any(String) }),
    );

    console.log(token);
  });

  test("Отредактировать задание PUT /todos/{id} @PUT", async ({ request }) => {

    let response = await request.put(`${URL}todos/122222`, {
      headers: {
        "x-challenger": token,
      },
      data: todo,
    });

    let headers = response.headers();
    expect(response.status()).toBe(400);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отправить запрос POST /challenger (201) @POST", async ({ request }) => {

    let response = await request.post(`${URL}challenger`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect(headers["x-challenger"].length).toBeGreaterThan(0);
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отправить запрос GET /challenges (200) @GET", async ({ request }) => {

    let response = await request.get(`${URL}challenges`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect((await response.json())["challenges"].length).toEqual(59);
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отправить запрос GET /todos (200) @GET", async ({ request }) => {

    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect((await response.json())["todos"].length).toBeGreaterThan(0);
    expect(response.status()).toBe(200);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отправить запрос GET /todo (404) not plural @GET", async ({ request }) => {

    let response = await request.get(`${URL}todo`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();
    expect(response.status()).toBe(404);
    expect(headers).toEqual(expect.objectContaining({ "x-challenger": token }));
  });

  test("Отправить запрос GET /todos/{id} (200) @GET", async ({ request }) => {
    let id = 1;
    let response = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect((await response.json())["todos"][0]['id']).toEqual(id);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos/{id} (404) @GET", async ({ request }) => {
    let id = 11;
    let response = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect(response.status()).toBe(404);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос HEAD /todos (200) @HEAD", async ({ request }) => {
    let response = await request.head(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });

    let headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (201) @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect((await response.json())["title"]).toEqual(todo["title"]);
    expect((await response.json())["description"]).toEqual(todo["description"]);
    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (200) ?filter @GET", async ({ request }) => {
    let filter = {
      "doneStatus": true
    };

    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      params: filter,
    });

    let headers = response.headers();

    (await response.json())["todos"].forEach(element => {
      expect(element["doneStatus"]).toBe(filter["doneStatus"]);
    });
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (400) @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "title": "A title",
        "doneStatus": 'example',
        "description": "my description"
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (400) title too long @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "title": faker.string.alpha(51),
        "doneStatus": true,
        "description": "my description"
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (400) description too long @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "title": "A title",
        "doneStatus": true,
        "description": faker.string.alpha(201)
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (201) max out content @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect((await response.json())["title"]).toEqual(todo["title"]);
    expect((await response.json())["description"]).toEqual(todo["description"]);
    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (413) content too long @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "title": "A title",
        "doneStatus": true,
        "description": faker.string.alpha(5001)
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(413);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (400) extra @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "": "",
        "": "",
        "": ""
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos/{id} (200) @POST", async ({ request }) => {
    let id = 2;
    let response = await request.post(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect((await response.json())["title"]).toEqual(todo["title"]);
    expect((await response.json())["description"]).toEqual(todo["description"]);    
    expect((await response.json())["id"]).toEqual(id);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos/{id} (404) @POST", async ({ request }) => {
    let id = 21;
    let response = await request.post(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect(response.status()).toBe(404);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /todos/{id} full (200) @PUT", async ({ request }) => {
    let id = 1;
    let response = await request.put(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: todo
    });

    let headers = response.headers();

    expect((await response.json())["title"]).toEqual(todo["title"]);
    expect((await response.json())["description"]).toEqual(todo["description"]);    
    expect((await response.json())["id"]).toEqual(id);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /todos/{id} partial (200) @PUT", async ({ request }) => {
    let id = 1;
    let title = faker.string.alpha(15)
    let response = await request.put(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "title": title,
      }
    });

    let headers = response.headers();

    expect((await response.json())["title"]).toEqual(title);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /todos/{id} no title (400) @PUT", async ({ request }) => {
    let id = 1;
    let response = await request.put(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "doneStatus": true,
        "description": faker.string.alpha(15)
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /todos/{id} no amend id (400) @PUT", async ({ request }) => {
    let id = 1;
    let response = await request.put(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      },
      data: {
        "id": faker.number.int({ min: 20, max: 100 }),
        "title": faker.string.alpha(15),
        "doneStatus": true,
        "description": faker.string.alpha(15)
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос DELETE /todos/{id} (200) @DELETE", async ({ request }) => {
    let id = 10;
    let response = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      }
    });
    expect((await response.json())['todos'].length).toBe(1);

    let deleteResponse = await request.delete(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      }
    });

    let headers = deleteResponse.headers();

    expect(deleteResponse.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);

    let responseAfterDelete = await request.get(`${URL}todos/${id}`, {
      headers: {
        "x-challenger": token,
      }
    });

    expect((await responseAfterDelete.json())['errorMessages'][0]).toEqual(`Could not find an instance with todos/${id}`);
  });

  test("Отправить запрос GET /todos (200) XML @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': "application/xml",
      }
    });

    let headers = response.headers();

    expect((await response.text()).indexOf("<")).toEqual(0);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (200) JSON @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': "application/json",
      }
    });

    let headers = response.headers();
    expect((await response.text()).indexOf("{")).toEqual(0);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (200) ANY @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': "*/*",
      }
    });

    let headers = response.headers();

    expect((await response.text()).indexOf("{")).toEqual(0);

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (200) XML pref @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': `application/xml, application/json`,
      }
    });

    let headers = response.headers();

    expect((await response.text()).indexOf("<")).toEqual(0);

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (200) no accept @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': "",
      }
    });

    let headers = response.headers();

    expect((await response.text()).indexOf("{")).toEqual(0);

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /todos (406) @GET", async ({ request }) => {
    let response = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        'Accept': "application/gzip",
      }
    });

    let headers = response.headers();

    expect(response.status()).toBe(406);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos XML @POST", async ({ request }) => {
    const value = `<?xml version="1.0" encoding="UTF-8" ?> 
        <title> "New Title"</title>
        <doneStatus>true</doneStatus>
        <description>"New description"</description>`;

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "accept": 'application/xml',
        "content-type": "application/xml",
      },
      data: value
    });
    let headers = response.headers();

    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos JSON @POST", async ({ request }) => {

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "accept": 'application/json',
        "content-type": "application/json",
      },
      data: todo
    });
    let headers = response.headers();

    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos (415) @POST", async ({ request }) => {

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "content-type": faker.string.alpha(10),
      },
      data: todo
    });
    let headers = response.headers();

    expect(response.status()).toBe(415);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /challenger/guid (existing X-CHALLENGER) @GET", async ({ request }) => {

    let response = await request.get(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    payload = await response.json();

    expect(payload["xAuthToken"].length).toBeGreaterThan(0);
    expect(payload["xChallenger"]).toEqual(token);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос 	PUT /challenger/guid RESTORE @PUT", async ({ request }) => {

    let response = await request.put(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: payload
    });
    let headers = response.headers();

    expect(await response.json()).toEqual(payload);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /challenger/guid CREATE @PUT", async ({ request }) => {
    await request.put(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: {}
    });

    let response = await request.put(`${URL}challenger/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: payload
    });
    let headers = response.headers();

    expect(await response.json()).toEqual(payload);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /challenger/database/guid (200) @GET", async ({ request }) => {
    let response = await request.get(`${URL}challenger/database/${token}`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    database = await response.json();

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PUT /challenger/database/guid (Update) @PUT", async ({ request }) => {
    let response = await request.put(`${URL}challenger/database/${token}`, {
      headers: {
        "x-challenger": token,
      },
      data: database
    });
    let headers = response.headers();

    expect(response.status()).toBe(204);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos XML to JSON @POST", async ({ request }) => {
    const value = `<?xml version="1.0" encoding="UTF-8" ?> 
        <title> "New Title"</title>
        <doneStatus>true</doneStatus>
        <description>"New description"</description>`;

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "accept": 'application/json',
        "content-type": "application/xml",
      },
      data: value
    });
    let headers = response.headers();

    expect((await response.text()).indexOf("{")).toEqual(0);

    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /todos JSON to XML @POST", async ({ request }) => {
    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token,
        "accept": 'application/xml',
        "content-type": "application/json",
      },
      data: todo
    });
    let headers = response.headers();

    expect((await response.text()).indexOf("<")).toEqual(0);

    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос DELETE /heartbeat (405) @DELETE", async ({ request }) => {
    let response = await request.delete(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(405);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос PATCH /heartbeat (500) @PATCH", async ({ request }) => {
    let response = await request.patch(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(500);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /heartbeat (204) @GET", async ({ request }) => {
    let response = await request.get(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(204);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /heartbeat as DELETE (405) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
        "X-HTTP-Method-Override": 'DELETE'
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(405);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /heartbeat as PATCH (500) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
        "X-HTTP-Method-Override": 'PATCH'
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(500);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /heartbeat as Trace (501) @POST", async ({ request }) => {
    let response = await request.post(`${URL}heartbeat`, {
      headers: {
        "x-challenger": token,
        "X-HTTP-Method-Override": 'TRACE'
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(501);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/token (401) @POST", async ({ request }) => {
    let response = await request.post(`${URL}secret/token`, {
      headers: {
        "x-challenger": token,
        "authorization": "Basic YWRtaW46cGFzc3dvcmRk"
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(401);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/token (201) @POST", async ({ request }) => {
    let response = await request.post(`${URL}secret/token`, {
      headers: {
        "x-challenger": token,
        "authorization": "Basic YWRtaW46cGFzc3dvcmQ="
      }
    });
    let headers = response.headers();

    xAuthToken = headers["x-auth-token"];
    expect(response.status()).toBe(201);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /secret/note (403) @GET", async ({ request }) => {
    let response = await request.get(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "X-AUTH-TOKEN": 'bob'
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(403);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /secret/note (401) @GET", async ({ request }) => {
    let response = await request.get(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(401);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /secret/note (200) @GET", async ({ request }) => {
    let response = await request.get(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "X-AUTH-TOKEN": xAuthToken
      }
    });
    let headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/note (200) @POST", async ({ request }) => {
    let note = { "note": "my note" }
    let response = await request.post(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "X-AUTH-TOKEN": xAuthToken
      },
      data: note
    });
    let headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/note (401) @POST", async ({ request }) => {
    let note = { "note": "my note" }
    let response = await request.post(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
      },
      data: note
    });
    let headers = response.headers();

    expect(response.status()).toBe(401);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/note (403) @POST", async ({ request }) => {
    let note = { "note": "my note" }
    let response = await request.post(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "X-AUTH-TOKEN": 'bob'
      },
      data: note
    });
    let headers = response.headers();

    expect(response.status()).toBe(403);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос GET /secret/note (Bearer) @GET", async ({ request }) => {
    let note = { "note": "my note" }
    let response = await request.get(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "Authorization": `Bearer ${xAuthToken}`
      },
      data: note
    });
    let headers = response.headers();

    expect(await response.json()).toEqual(note);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос POST /secret/note (Bearer) @POST", async ({ request }) => {
    let note = { "note": "my note" }
    let response = await request.post(`${URL}secret/note`, {
      headers: {
        "x-challenger": token,
        "Authorization": `Bearer ${xAuthToken}`
      },
      data: note
    });
    let headers = response.headers();

    expect(await response.json()).toEqual(note);
    expect(response.status()).toBe(200);
    expect(headers["x-challenger"]).toEqual(token);
  });

  test("Отправить запрос DELETE /todos/{id} (200) all @DELETE", async ({ request }) => {
    let responseTodos = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });

    let idNumber = (await responseTodos.json())['todos']

    for (let index = 0; index < idNumber.length; index++) {
      let response = await request.delete(`${URL}todos/${idNumber[index]['id']}`, {
        headers: {
          "x-challenger": token
        }
      });
      let headers = response.headers();

      expect(response.status()).toBe(200);
      expect(headers["x-challenger"]).toEqual(token);

    }
  });

  test("Отправить запрос POST /todos (201) all @POST", async ({ request }) => {
    let responseTodos = await request.get(`${URL}todos`, {
      headers: {
        "x-challenger": token,
      },
    });

    let idNumber = (await responseTodos.json())['todos']
    let count = 20 - idNumber.length;

    for (let index = 0; index < count; index++) {
      let response = await request.post(`${URL}todos`, {
        headers: {
          "x-challenger": token
        },
        data: todo
      });
      let headers = response.headers();

      expect(response.status()).toBe(201);
      expect(headers["x-challenger"]).toEqual(token);

    }

    let response = await request.post(`${URL}todos`, {
      headers: {
        "x-challenger": token
      },
      data: todo
    });
    let headers = response.headers();

    expect(response.status()).toBe(400);
    expect(headers["x-challenger"]).toEqual(token);
  });

});