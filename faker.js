var faker = require('faker');
const fs = require('fs');
const data = [];
for(let i = 0; i < 25; i++){
    data.push({
        postTitle: faker.lorem.sentence(),
        postContent: faker.lorem.paragraphs(),
        postType: 2,
        postImages: [faker.image.imageUrl(), faker.image.imageUrl(), faker.image.imageUrl()],
        postOwner: {
            name: faker.name.findName(),
            avatar: faker.image.avatar()
        }
    })
}
fs.writeFile('./data.json',JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
