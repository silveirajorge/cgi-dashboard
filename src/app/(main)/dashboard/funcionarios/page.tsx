import { FuncionariosTable } from "./_components/funcionarios-table";

export default function FuncionariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Funcionários</h1>
      </div>
      <FuncionariosTable />
    </div>
  );
}
