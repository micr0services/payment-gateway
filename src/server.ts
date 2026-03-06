import app from './app';

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Payment gateway server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});